import { useId } from 'react';

interface ThemeSwitchProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const ThemeSwitch = ({ isDarkMode, toggleTheme }: ThemeSwitchProps) => {
    const checkboxId = useId();

    return (
        <label
            className="relative inline-block cursor-pointer"
            style={{ width: '4em', height: '2.2em', fontSize: '17px' }}
        >
            <input
                id={checkboxId}
                type="checkbox"
                checked={!isDarkMode}
                onChange={toggleTheme}
                className="theme-switch-input opacity-0 w-0 h-0"
            />

            <span className="theme-switch-slider absolute top-0 left-0 right-0 bottom-0 bg-[#2a2a2a] rounded-[30px] overflow-hidden transition-all duration-400 shadow-lg">
                <div
                    className="theme-switch-star absolute bg-white rounded-full w-1.25 h-1.25 transition-all duration-400"
                    style={{ left: '2.5em', top: '0.5em' }}
                ></div>
                <div
                    className="theme-switch-star absolute bg-white rounded-full w-1.25 h-1.25 transition-all duration-400"
                    style={{ left: '2.2em', top: '1.2em' }}
                ></div>
                <div
                    className="theme-switch-star absolute bg-white rounded-full w-1.25 h-1.25 transition-all duration-400"
                    style={{ left: '3em', top: '0.9em' }}
                ></div>

                <svg
                    viewBox="0 0 16 16"
                    className="theme-switch-cloud absolute w-[3.5em] opacity-0 transition-all duration-400"
                    style={{ bottom: '-1.4em', left: '-1.1em' }}
                >
                    <path
                        transform="matrix(.77976 0 0 .78395-299.99-418.63)"
                        fill="#fff"
                        d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
                    ></path>
                </svg>
            </span>
        </label>
    );
};