export default class LoadingOverlay {
    constructor(options = {}) {
        this.options = {
            text: null,
            textSize: 20,
            color: '#000',
            backgroundColor: 'rgba(55, 110, 241, 0.4)', // Translucent background color
            borderRadius: '8px', // Border radius for rounded corners
            spinnerType: 'lds-roller', // Default spinner type
            ...options
        };
        this.targetClass = 'loading-overlay-container'; // Class of the target element
        this.overlayElement = null;
    }

    init(targetClass) {
        this.targetClass = targetClass;

        const targetElement = document.querySelector(`.${this.targetClass}`);
        if (!targetElement) {
            console.error(`No element found with class "${this.targetClass}"`);
            return;
        }

        this.removeExistingOverlay(targetElement);

        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'loading-overlay';
        this.overlayElement.style.position = 'absolute';
        this.overlayElement.style.top = '0';
        this.overlayElement.style.left = '0';
        this.overlayElement.style.width = '100%';
        this.overlayElement.style.height = '100%';
        this.overlayElement.style.backgroundColor = this.options.backgroundColor; // Translucent background
        this.overlayElement.style.color = this.options.color;
        this.overlayElement.style.display = 'flex';
        this.overlayElement.style.flexDirection = 'column'; // Stack spinner and text vertically
        this.overlayElement.style.alignItems = 'center';
        this.overlayElement.style.justifyContent = 'center';
        this.overlayElement.style.zIndex = '9999';
        this.overlayElement.style.borderRadius = this.options.borderRadius; // Apply border radius

        const spinner = this.createSpinner();
        this.overlayElement.appendChild(spinner);

        if (this.options.text) {
            const spinnerText = document.createElement('div');
            spinnerText.className = 'spinner-text';        
            spinnerText.textContent = this.options.text;
            spinnerText.style.marginTop = '10px'; // Space between spinner and text
            spinnerText.style.fontSize = `${this.options.textSize}px`;
            spinnerText.style.color = this.options.color;
            spinnerText.style.textAlign = 'center';
            spinnerText.style.fontFamily = 'Arial, sans-serif';
            this.overlayElement.appendChild(spinnerText);
        }

        targetElement.style.position = 'relative'; // Ensure target element is positioned
        targetElement.appendChild(this.overlayElement);
    }

    createSpinner() {
        const spinner = document.createElement('div');
        spinner.className = `${this.options.spinnerType}`;
    
        const spinnerTypes = {
            'lds-roller': 8
        };
        
        if (spinnerTypes[this.options.spinnerType]) {
            spinner.classList.add(this.options.spinnerType);
            const divCount = spinnerTypes[this.options.spinnerType] || 1;
            for (let i = 0; i < divCount; i++) {
                const dot = document.createElement('div');
                spinner.appendChild(dot);
            }
        }
    
        return spinner;
    }

    removeExistingOverlay(targetElement) {
        const existing = targetElement.querySelector('.loading-overlay');
        if (existing) {
            existing.remove();
        }
    }

    close() {
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
    }
}
