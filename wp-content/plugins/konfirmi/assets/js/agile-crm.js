class Konfirmi_AgileCRM extends Konfirmi_Base {
    constructor() {
        super();
        this.site_key = '';
        this.href = '';
        this.widgetSection = null;
        this.submitBtn = null;
        this.isConfirmed = false;

        this.errorSection = document.createElement('div');
        this.errorSection.style.color = 'red';
        this.errorSection.style.textAlign = 'center';
        this.formAction = '';
    }

    init(formSelector, timer) {
        const form = document.querySelector(formSelector);
		if(form){
            const widgetBlock = document.querySelector(`${formSelector} .agile-group input[id^=konfirmi-]`);
            this.formAction = form.getAttribute('action');
            form.setAttribute('action', '');
            this.submitBtn = document.querySelector(`${formSelector} button[type="submit"`);
            if(!widgetBlock) return;
            clearInterval(timer);
            this.submitBtn.setAttribute('type', 'button');
            const id = widgetBlock.getAttribute('id').replace('konfirmi-', '');
            this.getWidgetKey(id)
                .then(res => {
                    if(!res.data) {
                        this.submitBtn.setAttribute('type', 'submit');
                        form.setAttribute('action', this.formAction);
                        return;
                    }
                    this.site_key = res.data.siteKey;
                    this.renderWidget(id);
                    this.submitBtn.addEventListener('click', (e) => this.preSubmitForm(e, this));
                    
                    document.querySelector('#agile-form').appendChild(this.errorSection);
                });

            this.widgetSection = widgetBlock.parentNode.parentNode;
            this.widgetSection.innerHTML = '';

            const $formFields = document.querySelectorAll(`${formSelector} .agile-group`)
            Array.from($formFields).forEach(el => {
                const input = el.getElementsByTagName('input')[0];
                if(!input || input.getAttribute('type') === 'hidden') return;
                input.getAttribute('value', '');
                input.addEventListener('change', (e) => this.onValueChanged(e, this));
            });
		}
    }
    
    getWidgetKey(widget_id) {
        return fetch(`${konfirmiBackendUrl}/form/site-key/${widget_id}`)
            .then(res=>res.json())
    }

    renderWidget(widget_id){
        if(!this.widgetSection) return;
        this.widgetSection.innerHTML = `<div id="konfirmi-container-${widget_id}" class="konfirmi-container">
        <div onclick="window.open(this.getAttribute('data-url'),'Konfirmi','resizable,height=520,width=640')" data-url='${ this.href || `${konfirmiBackendUrl}/form/${this.site_key}` }' style="display: inline-block; cursor: pointer">
            <img src="${konfirmiBackendUrl}/form/${this.site_key}/get-button-background" onerror="document.querySelector('#konfirmi-container-${widget_id}').innerHTML=''" style="pointer-events: none;">
        </div>
            <input type="hidden" value="test_input"> 
        </div>`;
        const script = document.createElement('script');
        script.src=`${konfirmiBackendUrl}/static/konfirmi-script.min.js`;
        document.body.appendChild(script);
    }

    onValueChanged(e, self){
        self.href = self.href || `${konfirmiBackendUrl}/form/${self.site_key}`;
        self.href = self.href.replace('form/?', `form/${self.site_key}?`);
        const name = konfirmi_Config.agileInputSelectors[e.target.name];
        const params = new URL(self.href);
        params.searchParams.set(name, e.target.value);
        self.href = params.origin + params.pathname + '?' + params.searchParams.toString();
        if(!self.widgetSection) return;
        const $konfirmiDiv = self.widgetSection.querySelector('div>div>div');
        if($konfirmiDiv) {
            $konfirmiDiv.setAttribute('data-url', self.href);
        }
    }

    preSubmitForm(e, self){
        if(this.isConfirmed){
            return;
        }
        const token = self.widgetSection.querySelector('input[name=kf-widget-response]');
        if(token && token.value){
            self.checkToken(token.value)
            .then(() => {
                const form = document.querySelector('#agile-form');
                form.action = self.formAction;
                self.submitBtn.setAttribute('type', 'submit');
                self.errorSection.style.color = 'green';
                self.errorSection.innerText = konfirmi_Config.messages.wasVerified;
                this.isConfirmed = true;
                self.submitBtn.click();
            });
        } else {
            self.errorSection.innerText = konfirmi_Config.messages.pleaseVerify;
            self.submitBtn.setAttribute('type', 'button');
        }
    }
}

function konfirmi_agileCRMReady(){
    const agf = new Konfirmi_AgileCRM();

    const timer = setInterval(() => {
        agf.init('#agile-form', timer);
    }, 1000);
}

document.addEventListener("DOMContentLoaded", konfirmi_agileCRMReady);
