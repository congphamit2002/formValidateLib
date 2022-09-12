//thư viện validate tự viết
function Validation(formSelector) {

    //lấy ra class cha formgroup
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    //định nghĩa các hàm validate cho từng trường
    var validatorRules = {

        //ex: require
        require: function(value, message) {
                return value ? '' : message || 'Vui lòng nhập trường này'
        },

        //ex: email
        email: function(value, message) {
                    var keyValidate = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
                    return keyValidate.test(value) ? '' : message ||'Vui lòng nhập email hợp lệ'
        },

        //ex : min:6
        min: function(min, message) {
            return function(value) {
                return value.length >= min ? '' : message || `Vui lòng nhập ít nhất ${min} kí tự`
            }
        },max: function(max, message) {
            return function(value) {
                return value.length >= max ? '' : message || `Vui lòng nhập ít nhất ${max} kí tự`
            }
        },
        //confirm password: cần truyền vào 1 selector 
        //ex confirmed:#password
        confirmed: function(confirm, message) {
            return function(value) {
                var valueConfirm = document.querySelector(confirm).value
                return value === valueConfirm ? '' : message || 'Mật khẩu xác nhận không chính xác'
            }
        }
    }


    //Lấy ra tất cả các rules
    var formElement = document.querySelector(formSelector);
    var formRules = {}
    if(formElement) {
        var inputElements = formElement.querySelectorAll('[name][rules]')
        
        //lấy ra tất cả các rule và xử lý sự kiện cho chúng
        for(var input of inputElements) {
            var ruleAttribute = input.getAttribute('rules').split('|')
            for(var rule of ruleAttribute) {
                var ruleInfor
                var validateRule = validatorRules[rule]
                if(rule.includes(':')) {
                    ruleInfor =  rule.split(':')
                    validateRule = validatorRules[ruleInfor[0]](ruleInfor[1])
                }

                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(validateRule)
                } else {
                    formRules[input.name] = [validateRule]
                }
            }
            console.log(input.classList)
            input.onblur = handleValidate;
            input.oninput = handleClear;
        }

        //Xử lí khi submit form:
        //Nếu error thì kh cho submit
        //Nếu pass all thì cho submit mặc định
        formElement.onsubmit = function(e) {
            e.preventDefault()
            var isError = false
            for(var input of inputElements) {
                var error = handleValidate({
                    target: input
                })
                if(!error) {
                    isError = true
                }
            }
            if(!isError) {
                formElement.submit()
            }
        }
        
        //xử lý validate các trường
        function handleValidate(e) {
           
            var name = e.target.name
            var value = e.target.value
            var rules = formRules[name]
            var errorMessage
            for(var rule of rules) {
                switch(e.target.type) {
                    case 'radio':
                    case 'checkbox': {
                        errorMessage = rule(formElement.querySelector(`input[name="${e.target.name}"]:checked`))
                        break;
                    }
                    default: 
                        errorMessage = rule(value);
                }
                if(errorMessage)
                    break
            }

            var formGroup = getParent(e.target, '.form-group')
            if(formGroup) {
                var formMessage = formGroup.querySelector('.form-message')
                if(formMessage) {
                    if(errorMessage) {
                        formGroup.classList.add('invalid')
                        formMessage.innerText = errorMessage;
                    }
                }
            }
            console.log(!errorMessage)
            return !errorMessage
        }

        //xóa đi error khi nhập đúng
        function handleClear(e) {
            var formGroup = getParent(e.target, '.form-group')
            var formMessage = formGroup.querySelector('.form-message')
                if(formMessage) {
                    if(formGroup.matches('.invalid'))
                    {
                        formGroup.classList.remove('invalid')
                        formMessage.innerText = '';
                    }
                }
        }
    }
    console.log(formRules)
}