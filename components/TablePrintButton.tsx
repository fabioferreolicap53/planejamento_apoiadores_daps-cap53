import React, { useRef, useState, useEffect } from 'react';

interface TablePrintButtonProps {
  tableId?: string;
  tableRef?: React.RefObject<HTMLTableElement>;
  title?: string;
  filters?: {
    status: string;
    eixo: string;
    linha: string;
    apoiador: string;
    startDate: string;
    endDate: string;
    search: string;
  };
  totalRecords?: number;
}

type Orientation = 'portrait' | 'landscape';

const TablePrintButton: React.FC<TablePrintButtonProps> = ({
  tableId,
  tableRef,
  title = 'Relatório de Planos',
  filters,
  totalRecords = 0
}) => {
  const printWindowRef = useRef<Window | null>(null);
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [showOrientationMenu, setShowOrientationMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOrientationMenu(false);
      }
    };

    if (showOrientationMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOrientationMenu]);

  const getTableHTML = (): string => {
    let tableElement: HTMLTableElement | null = null;
    
    if (tableRef?.current) {
      tableElement = tableRef.current;
    } else if (tableId) {
      tableElement = document.getElementById(tableId) as HTMLTableElement;
    } else {
      // Tenta encontrar a primeira tabela no documento
      tableElement = document.querySelector('table');
    }

    if (!tableElement) {
      console.error('Nenhuma tabela encontrada para impressão');
      return '';
    }

    // Clona a tabela para não modificar a original
    const clonedTable = tableElement.cloneNode(true) as HTMLTableElement;
    
    // Remove elementos de ação (botões) da tabela clonada
    const actionCells = clonedTable.querySelectorAll('td:last-child, th:last-child');
    actionCells.forEach(cell => {
      if (cell.textContent?.includes('Ações') || cell.querySelector('button')) {
        cell.remove();
      }
    });

    // Remove classes de hover e outras classes visuais
    clonedTable.querySelectorAll('*').forEach(element => {
      element.classList.remove('hover:bg-[#f0f9ff]', 'dark:hover:bg-blue-900/10', 'group-hover:bg-[#f0f9ff]', 'dark:group-hover:bg-blue-900/10');
      element.classList.add('print-table');
    });

    return clonedTable.outerHTML;
  };

  const generatePrintContent = (tableHTML: string, orientation: Orientation): string => {
    const reportDate = new Date().toLocaleString('pt-BR');
    const isLandscape = orientation === 'landscape';
    
    let filterSummary = '';
    if (filters) {
      const activeFilters = [];
      if (filters.status !== 'Todos') activeFilters.push(`Status: ${filters.status}`);
      if (filters.eixo !== 'Todos') activeFilters.push(`Eixo: ${filters.eixo}`);
      if (filters.linha !== 'Todos') activeFilters.push(`Linha: ${filters.linha}`);
      if (filters.apoiador !== 'Todos') activeFilters.push(`Apoiador: ${filters.apoiador}`);
      if (filters.startDate) activeFilters.push(`De: ${filters.startDate}`);
      if (filters.endDate) activeFilters.push(`Até: ${filters.endDate}`);
      if (filters.search) activeFilters.push(`Busca: "${filters.search}"`);

      if (activeFilters.length > 0) {
        filterSummary = `
          <div class="filter-summary">
            <span class="filter-label">Filtros:</span>
            <span class="filter-values">${activeFilters.join(' | ')}</span>
          </div>
        `;
      }
    }

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${title}</title>
        <style>
          @media print {
            /* Definição explícita da página para evitar rotação automática */
            @page {
              size: A4 ${orientation};
              margin: 5mm;
            }
            
            /* Força orientação retrato explicitamente se necessário */
            @page :first {
              size: A4 ${orientation};
            }
            
            /* Previne qualquer transformação de rotação */
            html {
              transform: none !important;
              transform-origin: 0 0 !important;
              width: 100%;
              height: 100%;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', sans-serif;
              font-size: 8pt;
              line-height: 1.2;
              color: #000;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              width: 100%;
              height: 100%;
              transform: none !important;
              transform-origin: 0 0 !important;
            }
            
            .print-container {
              width: 100%;
              max-width: ${isLandscape ? '297mm' : '210mm'};
              margin: 0 auto;
              transform: none !important;
              transform-origin: 0 0 !important;
            }
            
            .no-print {
              display: none !important;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              page-break-inside: auto;
              font-size: ${isLandscape ? '8pt' : '7pt'};
              margin-top: 4px;
            }
            
            th {
              background-color: #f8f9fa !important;
              color: #374151 !important;
              font-weight: 700;
              text-transform: uppercase;
              padding: ${isLandscape ? '6px 8px' : '4px 6px'};
              border: 1px solid #d1d5db;
              text-align: left;
              vertical-align: middle;
              font-size: ${isLandscape ? '8pt' : '7pt'};
            }
            
            td {
              padding: ${isLandscape ? '6px 8px' : '4px 6px'};
              border: 1px solid #d1d5db;
              vertical-align: top;
              page-break-inside: avoid;
              page-break-after: auto;
              font-size: ${isLandscape ? '8pt' : '7pt'};
            }
            
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            thead {
              display: table-header-group;
            }
            
            tfoot {
              display: table-footer-group;
            }
            
            .print-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .header {
              border-bottom: 1px solid #1e40af;
              padding-bottom: 4px;
              margin-bottom: 6px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            
            .header-left h1 {
              color: #1e40af;
              font-size: ${isLandscape ? '11pt' : '10pt'};
              font-weight: 900;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: -0.5px;
              line-height: 1.1;
            }
            
            .header-left p {
              color: #4b5563;
              font-size: ${isLandscape ? '8pt' : '7pt'};
              font-weight: 600;
              margin: 1px 0 0 0;
            }
            
            .metadata {
              text-align: right;
              font-size: 6pt;
              color: #6b7280;
              line-height: 1.1;
            }
            
            .metadata p {
              margin: 0;
            }
            
            .filter-summary {
              background-color: #f8f9fa;
              border: 1px solid #e5e7eb;
              border-radius: 3px;
              padding: 4px 6px;
              margin-bottom: 6px;
              font-size: 7pt;
              display: flex;
              align-items: center;
            }
            
            .filter-label {
              color: #374151;
              font-weight: 700;
              margin-right: 6px;
              white-space: nowrap;
            }
            
            .filter-values {
              color: #6b7280;
              flex: 1;
            }
            
            .footer {
              margin-top: 8px;
              padding-top: 4px;
              border-top: 1px solid #d1d5db;
              font-size: 6pt;
              color: #6b7280;
            }
            
            .footer-content {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            
            .signature-line {
              margin-top: 15px;
              border-top: 1px solid #000;
              width: 120px;
              text-align: center;
              padding-top: 1px;
              font-size: 6pt;
            }
            
            .system-info {
              text-align: right;
              font-size: 6pt;
              color: #6b7280;
            }
          }
          
          @media screen {
            body {
              font-family: 'Inter', sans-serif;
              padding: 10px;
              background: #f5f5f5;
            }
            
            .print-container {
              max-width: 210mm;
              margin: 0 auto;
              background: white;
              padding: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <div class="header-left">
              <h1>DAPS / CAP 5.3</h1>
              <p>${title}</p>
            </div>
            <div class="metadata">
              <p>${reportDate}</p>
              <p>Registros: ${totalRecords}</p>
            </div>
          </div>
          
          ${filterSummary}
          
          ${tableHTML}
          
          <div class="footer">
            <div class="footer-content">
              <div class="signature-line">
                <p>Responsável Técnico</p>
              </div>
              <div class="system-info">
                <p>Sistema DAPS/CAP 5.3</p>
                <p>Página 1 de 1</p>
              </div>
            </div>
          </div>
        </div>
        
        <script>
          // Auto-print quando a página carrega
          window.onload = function() {
            setTimeout(() => {
              window.print();
              setTimeout(() => {
                window.close();
              }, 100);
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const tableHTML = getTableHTML();
    if (!tableHTML) {
      alert('Nenhuma tabela encontrada para impressão. Certifique-se de que há uma tabela visível na página.');
      return;
    }

    const printContent = generatePrintContent(tableHTML, orientation);
    
    // Fecha a janela anterior se existir
    if (printWindowRef.current && !printWindowRef.current.closed) {
      printWindowRef.current.close();
    }

    // Abre nova janela para impressão
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir a tabela.');
      return;
    }

    printWindowRef.current = printWindow;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowOrientationMenu(!showOrientationMenu)}
          className="flex items-center justify-center rounded-xl h-9 md:h-10 px-3 md:px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 gap-1.5 text-[10px] md:text-sm font-medium shadow-md shadow-gray-300/20 transition-all active:scale-95 whitespace-nowrap"
          title="Selecionar orientação da página"
        >
          <span className="material-symbols-outlined text-[18px] md:text-[20px]">
            {orientation === 'portrait' ? 'vertical_align_top' : 'horizontal_distribute'}
          </span>
          <span>{orientation === 'portrait' ? 'Retrato' : 'Paisagem'}</span>
        </button>
        
        <button
          onClick={handlePrint}
          className="flex items-center justify-center rounded-xl h-9 md:h-10 px-3 md:px-5 bg-gray-200 hover:bg-gray-300 text-gray-800 gap-1.5 text-[10px] md:text-sm font-bold shadow-md shadow-gray-300/20 transition-all active:scale-95 whitespace-nowrap"
          title={`Imprimir tabela selecionada (${orientation === 'portrait' ? 'Retrato' : 'Paisagem'})`}
        >
          <span className="material-symbols-outlined text-[18px] md:text-[20px]">print</span>
          <span>Imprimir ({orientation === 'portrait' ? 'Retrato' : 'Paisagem'})</span>
        </button>
      </div>
      
      {showOrientationMenu && (
        <div ref={menuRef} className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 mb-2 px-2">ORIENTAÇÃO DA PÁGINA</div>
            <button
              onClick={() => {
                setOrientation('portrait');
                setShowOrientationMenu(false);
              }}
              className={`flex items-center w-full px-3 py-2 text-sm rounded-md mb-1 ${orientation === 'portrait' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <span className="material-symbols-outlined text-[18px] mr-2">vertical_align_top</span>
              <span>Retrato (Vertical)</span>
              {orientation === 'portrait' && (
                <span className="material-symbols-outlined text-[16px] ml-auto text-blue-600">check</span>
              )}
            </button>
            <button
              onClick={() => {
                setOrientation('landscape');
                setShowOrientationMenu(false);
              }}
              className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${orientation === 'landscape' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <span className="material-symbols-outlined text-[18px] mr-2">horizontal_distribute</span>
              <span>Paisagem (Horizontal)</span>
              {orientation === 'landscape' && (
                <span className="material-symbols-outlined text-[16px] ml-auto text-blue-600">check</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablePrintButton;