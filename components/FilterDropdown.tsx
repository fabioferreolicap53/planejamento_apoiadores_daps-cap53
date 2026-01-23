import React from 'react';

interface FilterDropdownProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    icon: string;
    className?: string;
    compact?: boolean;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
    label,
    value,
    options,
    onChange,
    icon,
    className = "",
    compact = false
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`flex items-center gap-3 flex-1 w-full group relative transition-all ${className}`} ref={dropdownRef}>
            <span className="material-symbols-outlined text-primary/70 !text-[20px] group-hover:text-primary shrink-0 transition-colors">
                {icon}
            </span>
            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[9px] font-bold text-[#617589] dark:text-gray-400 uppercase leading-none mb-0.5">{label}</span>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center w-full bg-transparent p-0 h-6 text-xs font-bold text-primary focus:outline-none truncate hover:text-blue-600 transition-colors text-left"
                >
                    <span className="truncate flex-1">{value}</span>
                    <span className={`material-symbols-outlined transition-transform duration-200 text-primary/40 !text-[18px] ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full min-w-[220px] bg-white dark:bg-[#1A2633] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
                    <div className="max-h-[300px] overflow-y-auto py-1 custom-scrollbar">
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => {
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-[11px] font-bold transition-all flex items-center justify-between group/item
                  ${value === opt
                                        ? 'bg-primary/5 text-primary'
                                        : 'text-[#617589] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary dark:hover:text-white'}`}
                            >
                                <span className="truncate flex-1">{opt}</span>
                                {value === opt && (
                                    <span className="material-symbols-outlined !text-[16px]">check</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
