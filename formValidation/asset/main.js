
function Validation (options) {

    var formElement = document.querySelector(options.form) 
    var  selectorRules = {}

    function getParent(element, selector ) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    function validate(inputElement ,rule) {
            var parentInputElement = getParent(inputElement, options.formGroup);
            var value = inputElement.value;
            var message 
            
            // Lấy ra các rules của selector
            var rules = selectorRules[rule.selector];
            

            // Lặp qua từng rule & kiểm tra
            // Nếu có lỗi thì dừng việc kiểm
            for(var i = 0; i < rules.length; i++ ) {
                switch(inputElement.type) {
                    case 'radio':
                    case 'checkbox': {
                        message = rules[i](formElement.querySelector(rule.selector + ':checked'))
                        console.log(formElement.querySelector(rule.selector + ':checked'))
                        break;
                    }
                    default: 
                        message = rules[i](value);
                }
                if(message)
                    break;
            }

            if(message) {
                parentInputElement.classList.add('invalid')
                parentInputElement.querySelector(options.errorSelector).innerText = message;
            } else {
                parentInputElement.classList.remove ('invalid')
                parentInputElement.querySelector(options.errorSelector).innerText = message;
            }
            return !message;
    }


    if(formElement) {

        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)

                    var message = validate(inputElement, rule)
                    if(!message) {
                        isValid = false
                    }
            })  

            if(isValid) {
                formElement.submit()
            } 
        }

        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach(function (rule) {

            // Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector)

            console.log(inputElements)
            
            Array.from(inputElements).forEach(function(inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }

                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function() {
                    if(inputElement.value.trim() != '') {
                        getParent(inputElement, options.formGroup).classList.remove('invalid')
                        getParent(inputElement, options.formGroup).querySelector(options.errorSelector).innerText = ''
                    }
                }
            }) 
        })
    }
}

Validation.isRequire = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? '' : message || 'Vui lòng nhập trường này'
        }
    }
}

Validation.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var keyValidate = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return keyValidate.test(value) ? '' : message ||'Vui lòng nhập email hợp lệ'
        }
    }
}

Validation.isMinLength = function(selector, minLength, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= minLength ? '' : message || `Vui lòng nhập ít nhất ${minLength} kí tự`
        }
    }
}

Validation.isConfirmed = function(selector ,message, getConfirm) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirm() ? '' : message || 'Vui lòng nhập đúng trường này'
        }
    }
}