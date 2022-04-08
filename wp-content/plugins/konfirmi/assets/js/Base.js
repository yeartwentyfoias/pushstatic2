if (typeof konfirmi_Config === 'undefined') konfirmi_Config = { messages: {} };

class Konfirmi_Base {
    constructor(){
        this.href = '';
    }
    async checkToken(token) {
        await this.request("GET", konfirmiBackendUrl + "/api/result/" + token, '');
    }

    showNotification(container, message) {
        container.insertAdjacentHTML('afterend', '<div id="' + konfirmi_Config.notificationId + '" class="alert alert-error">'+ message +'</div>');
    }

    static parse_query_string(query) {
        if (!query) return {};
        const vars = query.split("&");
        let query_string = {};
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split("=");
            const key = decodeURIComponent(pair[0]);
            const value = decodeURIComponent(pair[1]);
            // If first entry with this name
            if (typeof query_string[key] === "undefined") {
                query_string[key] = decodeURIComponent(value);
                // If second entry with this name
            } else if (typeof query_string[key] === "string") {
                var arr = [query_string[key], decodeURIComponent(value)];
                query_string[key] = arr;
                // If third or later entry with this name
            } else {
                query_string[key].push(decodeURIComponent(value));
            }
        }
        return query_string;
    }
    
    static addSearchParam(src, key, value) {
        const parser = document.createElement('a');
        parser.href = src;
        const searchParams = Konfirmi_Base.parse_query_string(parser.search.substring(1));
        if (key && value) searchParams[key] = value;
        let str = '?';
        for (let prop in searchParams) {
            if (searchParams.hasOwnProperty(prop) && searchParams[prop])
                str += (encodeURIComponent(prop) + '=' + encodeURIComponent(searchParams[prop]) + '&');
        }
        return parser.origin + parser.pathname + str.substring(0, str.length - 1);
    }

    request(method, url, data) {
        return new Promise((resolve, reject) => {
            const xmlhttpVerify = new XMLHttpRequest();
            xmlhttpVerify.onreadystatechange = () => {
                if (xmlhttpVerify.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
                    
                    if (xmlhttpVerify.status == 200 || xmlhttpVerify.status == 304) {
                        resolve(JSON.parse(xmlhttpVerify.responseText));
                    }
                    else if (xmlhttpVerify.status == 400) {
                        reject(konfirmi_Config.messages.serverError);
                    }
                    else {
                        reject(konfirmi_Config.messages.smthWentWrong);
                    }

                }
            };
            xmlhttpVerify.open(method, url, true);
            if (method == 'POST') {
                xmlhttpVerify.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            xmlhttpVerify.send(data);
        })
    }

    removeAlert() {
        const alert = document.getElementById(konfirmi_Config.notificationId);
        if(alert != null){
            alert.remove();
        }
    }

    initChange(formElement, selector, formSelector, customClasses) {
        const addSearchParam = Konfirmi_Base.addSearchParam;
        formElement.querySelectorAll(selector).forEach(function(group, i){
			group.addEventListener('change', function(e){ 
                if (customClasses) {
                    for (var konf_class in customClasses){
                        for (var i = 0; i < group.classList.length; i++) {
                            
                            if(group.classList[i] == konf_class){       
                                var input = this.querySelector('input');
                                const konfirmiIframe = input.closest(formSelector).querySelector(konfirmi_Config.konfirmiContainerSelector + ' div')
                                if(konfirmiIframe) {
                                    this.href = konfirmiIframe.getAttribute('data-url');
                                    konfirmiIframe.setAttribute('data-url', addSearchParam(this.href, customClasses[konf_class], input.value));
                                }	
                            } else {
                                let fieldClases = e.srcElement.parentNode.parentNode.className.split(' ');
                                let fieldName = '';
                                fieldClases.forEach(el => {
                                    if (customClasses[el]) fieldName = customClasses[el];
                                    return el;
                                });
                                const el = e.srcElement;
                                const parentForm = el.closest(formSelector);
                                const konfirmiIframe = parentForm.querySelector(konfirmi_Config.konfirmiContainerSelector + ' div')
                                if(konfirmiIframe) {
                                    this.href = konfirmiIframe.getAttribute('data-url');
                                    konfirmiIframe.setAttribute('data-url', addSearchParam(this.href, fieldName || el.name, el.value));
                                }	
                            }
                        }
                    }
                } else {
                    const el = e.srcElement;
                    const parentForm = el.closest(formSelector);
                    const konfirmiIframe = parentForm.querySelector(konfirmi_Config.konfirmiContainerSelector + ' div')
                    if(konfirmiIframe) {
                        this.href = konfirmiIframe.getAttribute('data-url');
                        konfirmiIframe.setAttribute('data-url', addSearchParam(this.href, el.name, el.value));
                    }
                }
			});
		});
    }

    initSubmit(formElement, btnSelector, formSelector) {
        let isVerified = false;
        formElement.querySelectorAll(btnSelector).forEach((el) => {
			if(el.type == 'submit') {
				el.addEventListener('click', (e) => {
					if (isVerified) {
                        return e;
                    } else {
                        e.preventDefault();
                    }

					const input = el.closest(formSelector).querySelector('.konfirmi-container #kf-widget-response-0');
                    this.removeAlert();

					if(input == null || input.value == null || input.value == ''){
                        const container = el.closest(formSelector).querySelector('.konfirmi-container');
						this.showNotification(container, konfirmi_Config.messages.pleaseVerify);
						return e;
                    }

					const result = this.checkToken(input.value).catch((err) => this.showNotification(container, err));
					if (result.data == false) {
						this.showNotification(container, konfirmi_Config.messages.pleaseVerify);
					} else {
                        isVerified = true;
						this.showNotification(container, konfirmi_Config.messages.wasVerified);
                        el.click();
                        // Only for Gravity forms !!!
                        const form = el.closest(formSelector).querySelector('form');
                        if (form) form.submit();
					}
				});
			}
		});
    }

    init(formSelector) {
        
    }

}

function konfirmiSuccessCallback(token, widgetId){
    if(token){
        const forms = document.getElementsByTagName('form');
        const formWithWidget = Array.from(forms).filter((f) => !!f.querySelector(`.active_widget#konfirmi-container-${widgetId}`))[0];
    if (formWithWidget) {

        // for ninja form only
        const isNinjaForm = !!formWithWidget.querySelector('.nf-form-content  nf-field');
        if (isNinjaForm) {
            const submitBtn = formWithWidget.querySelector('.submit-container input.ninja-forms-field');
            return submitBtn.click();
        }

        return formWithWidget.submit();
    }
        
    // for woocommerce only
      if(konfirmi_wooCommerceForm.$form) {
          if (!konfirmi_wooCommerceForm.$form.querySelector(`#konfirmi-container-${widgetId}`)) return;
        setTimeout(() => {
            konfirmi_wooCommerceForm.isCanSubmit = true;
            konfirmi_wooCommerceForm.$submitBtn.setAttribute('type', 'submit');
            konfirmi_wooCommerceForm.$submitBtn.click();
            konfirmi_wooCommerceForm.isCanSubmit = false;
          }, 3000);
      }
      
    }
  }