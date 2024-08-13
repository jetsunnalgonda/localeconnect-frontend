export default class WaitMe {
  constructor(options) {
    this.options = {
      effect: 'bounce',
      text: '',
      bg: 'rgba(255,255,255,0.7)',
      color: '#000',
      maxSize: '',
      waitTime: -1,
      textPos: 'vertical',
      fontSize: '',
      source: '',
      onClose: () => { },
      ...options
    };

    this.elem = null;
    this.waitMeDivObj = null;
  }

  init(target) {
    this.elem = document.querySelector(target);

    if (!this.elem) return;

    this.removeExistingWaitMe();

    const elemClass = 'waitMe';
    const effectElemCount = this.getEffectElemCount();
    const effectElemHTML = this.getEffectElemHTML(effectElemCount, elemClass);
    const effectObj = this.createEffectObj(effectElemCount, effectElemHTML, elemClass);
    const waitMeText = this.createWaitMeText(elemClass);

    const waitMeDivObj = document.createElement('div');
    waitMeDivObj.className = `${elemClass}_content ${this.options.textPos}`;
    waitMeDivObj.appendChild(effectObj);
    if (waitMeText) waitMeDivObj.appendChild(waitMeText);

    this.waitMeDivObj = waitMeDivObj;
    this.elem.classList.add(`${elemClass}_container`);
    this.elem.appendChild(waitMeDivObj);

    if (this.options.waitTime > 0) {
      setTimeout(() => this.close(), this.options.waitTime);
    }

    this.handleScroll();
  }

  getEffectElemCount() {
    switch (this.options.effect) {
      case 'none': return 0;
      case 'bounce': return 3;
      case 'rotateplane': return 1;
      case 'stretch': return 5;
      case 'orbit': return 2;
      case 'roundBounce': return 12;
      case 'win8':
      case 'win8_linear': return 5;
      case 'ios': return 12;
      case 'facebook': return 3;
      case 'rotation': return 1;
      case 'timer': return 2;
      case 'pulse': return 1;
      case 'progressBar': return 1;
      case 'bouncePulse': return 3;
      case 'img': return 1;
      default: return 0;
    }
  }

  getEffectElemHTML(count, elemClass) {
    let effectElemHTML = '';
    if (count > 0) {
      for (let i = 1; i <= count; ++i) {
        const color = Array.isArray(this.options.color) ? this.options.color[i] || '#000' : this.options.color;
        effectElemHTML += `<div class="${elemClass}_progress_elem${i}" style="border-color:${color}"></div>`;
      }
    }
    return effectElemHTML;
  }

  createEffectObj(count, effectElemHTML, elemClass) {
    if (count === 0) return null;
    const effectObj = document.createElement('div');
    effectObj.className = `${elemClass}_progress ${this.options.effect}`;
    effectObj.innerHTML = effectElemHTML;
    effectObj.style.borderColor = this.options.color;
    return effectObj;
  }

  createWaitMeText(elemClass) {
    if (!this.options.text) return null;
    const waitMeText = document.createElement('div');
    waitMeText.className = `${elemClass}_text`;
    waitMeText.style.color = Array.isArray(this.options.color) ? this.options.color[0] : this.options.color;
    waitMeText.style.fontSize = this.options.fontSize || '';
    waitMeText.textContent = this.options.text;
    return waitMeText;
  }

  removeExistingWaitMe() {
    const existing = this.elem.querySelector('.waitMe');
    if (existing) {
      existing.remove();
    }
  }

  handleScroll() {
    if (this.elem.offsetHeight > window.innerHeight) {
      const updatePosition = () => {
        const elemContent = this.elem.querySelector('.waitMe_content');
        elemContent.style.marginTop = `-${elemContent.offsetHeight / 2}px`;
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition);
    }
  }

  close() {
    if (this.elem) {
      this.elem.classList.remove('waitMe_container');
      const waitMeElem = this.elem.querySelector('.waitMe');
      if (waitMeElem) {
        waitMeElem.remove();
      }
      if (this.options.onClose) {
        this.options.onClose(this.elem);
      }
    }
  }
}
