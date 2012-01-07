/*
* Really easy field validation with Prototype
* http://tetlaw.id.au/view/javascript/really-easy-field-validation
* Andrew Tetlaw
* Version 1.5.4.1 (2007-01-05)
* 
* Copyright (c) 2007 Andrew Tetlaw
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use, copy,
* modify, merge, publish, distribute, sublicense, and/or sell copies
* of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
* BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
* ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
* CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
* 
*/

(function() {

    var PhonyPrototypeJs = {
        addClassName :function (elm, className) {
            rspace = /\s+/;
            if ( className && typeof className === "string" ) {
                classNames = className.split( rspace );

                if ( elm.nodeType === 1 ) {
                    if ( !elm.className && classNames.length === 1 ) {
                        elm.className = className;

                    } else {
                        setClass = " " + elm.className + " ";

                        for ( c = 0, cl = classNames.length; c < cl; c++ ) {
                            if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
                                setClass += classNames[ c ] + " ";
                            }
                        }
                        elm.className = setClass;
                    }
                }
            }
        },

        removeClassName :function (elm, className){
            elm.className.replace(new RegExp(className), "");
        },


        extendObject :function (destination, source) {
            for (var property in source) {
                destination[property] = source[property];
            }
            return destination;
        },

        visible:function (elem) {
            return elem.style.display != 'none';
        },

        iterate:function (iterable, callback) {
            for (var i=0; i < iterable.length; i++) {
                val = iterable[i];
                callback(val);
            }
        },

        all:function (iterable) {
            var result = true;
    
            if (!iterable) {
                return false;
            }
    
            this.iterate( iterable, function(value) {
                result = result && value;
            });
            return result;
        },

        any:function  (iterable, callback) {
            var result = true;
            this.iterate(iterable, function(value, index) {
                if (value) {
                    result = value;
                }
            });
            return result;
        },

        collect:function (iterable, callback) {
            var results = [];
            this.iterate(iterable, function(value, index) {
                val = callback(value);
                results.push(val);
            });
            return results;
        },

        classNamesList:function (elem){
            try{
                return elem.className.split(/\s/);
            }
            catch(e) {
                console.log(elem);
            }
        },

        getFormElements:function (form_elem) {
            var elements = form_elem.elements;
            var form_elements = [];
            this.iterate(elements, function(element) {
                tagName = element.tagName.toUpperCase();
                if (tagName == "INPUT" || tagName=="SELECT") {
                    form_elements.push(element);
                }
            });
            
            return form_elements;
        },

        observeEvent:function (elem, eventName, callback) {
            if (!elem) {
                elem=document;
            }
            document.addEventListener(eventName, callback, false);
        }
    };


(function() { 

var ValidatorObj = function() {
     return {
        init: function(className, error, test, options) {
            if(typeof test === 'function'){
                this.options = options ? options : {};
                this._test = test;
            } else {
                this.options = test;
                this._test = function(){return true;};
            }
            this.error = error || 'Validation failed.';
            this.className = className;
        },
	test : function(v, elm) {
            return (this._test(v,elm) && PhonyPrototypeJs.all(this.options, function(p){
                return ValidatorObj.methods[p.key] ? ValidatorObj.methods[p.key](v,elm,p.value) : true;
            }));
	},
        methods : {
            pattern : function(v,elm,opt) {return Validation.get('IsEmpty').test(v) || opt.test(v);},
            minLength : function(v,elm,opt) {return v.length >= opt;},
            maxLength : function(v,elm,opt) {return v.length <= opt;},
            min : function(v,elm,opt) {return v >= parseFloat(opt);}, 
            max : function(v,elm,opt) {return v <= parseFloat(opt);},
            notOneOf : function(v,elm,opt) {return PhonyPrototypeJs.all(PhonyPrototypeJs.iterate(opt), function(value) {
                    return v !== value;
                });},
            oneOf : function(v,elm,opt) {return PhonyPrototypeJs.iterate(opt).PhonyPrototypeJs.any(function(value) {
                    return v === value;
                });},
            'is' : function(v,elm,opt) {return v === opt;},
            isNot : function(v,elm,opt) {return v !== opt;},
            equalToField : function(v,elm,opt) {return v === opt.value;},
            notEqualToField : function(v,elm,opt) {return v !== opt.value;},
            include : function(v,elm,opt) {return PhonyPrototypeJs.all(PhonyPrototypeJs.iterate(opt),function(value) {
                    return Validation.get(value).test(v,elm);
                });}
        }
    }
};

var Validator = function(className, error, test, options) {
    validatorObj = ValidatorObj();
    validatorObj.init(className, error, test, options);
    return validatorObj;
};

window.Validator = Validator;
})();

(function() { 
        
    var ValidationObj = (function() {
        function onSubmit (ev){
                if(!this.validate()) {
                    Event.stop(ev);
                }
            };
        
        return {
            options : {},
            form : null, 
            init: function(form, options) {
                this.options = PhonyPrototypeJs.extendObject({
                    onSubmit : true,
                    stopOnFirst : false,
                    immediate : false,
                    focusOnError : true,
                    useTitles : false,
                    onFormValidate : function(result, form) {},
                    onElementValidate : function(result, elm) {}
                }, options || {});
                this.form = document.getElementById(form);        
        
                if(this.options.onSubmit) {
                    PhonyPrototypeJs.observeEvent(this.form,'submit',onSubmit.bind(this),false);
                }
                if(this.options.immediate) {
                    var useTitles = this.options.useTitles;
                    var callback = this.options.onElementValidate;
            
            
                    PhonyPrototypeJs.iterate(PhonyPrototypeJs.getFormElements(this.form),function(input) { // Thanks Mike!
                        PhonyPrototypeJs.observeEvent(input, 'blur', function(ev) {
                            ValidationObj.validateElm(ev, {
                                useTitle : useTitles, 
                                onElementValidate : callback
                            });
                        });
                    });
                }
            } ,
            validate : function() {
                var result = false;
                var useTitles = this.options.useTitles;
                var callback = this.options.onElementValidate;
                if(this.options.stopOnFirst) {
                    result = PhonyPrototypeJs.all( PhonyPrototypeJs.getFormElements(this.form), function(elm) {
                        return ValidationObj.validateElm(elm,{
                            useTitle : useTitles, 
                            onElementValidate : callback
                        });
                    });
                } else {
                    /*
                     * result = Form.getElements(this.form).collect(function(elm) {
                                        if (elm.hasClassName('local-validation') && !this.isElementInForm(elm, this.form)) {
                                            return true;
                                        }
                                        return ValidationObj.validate(elm,{useTitle : useTitles, onElementValidate : callback});
                                    }, this).all();
                     */
                    result = PhonyPrototypeJs.all( PhonyPrototypeJs.collect( PhonyPrototypeJs.getFormElements(this.form), function(elm) {
                        return ValidationObj.validateElm( elm, {
                            useTitle : useTitles, 
                            onElementValidate : callback
                        });
                    }) );
                }
                if(!result && this.options.focusOnError) {
//                    TODO: punting on this right now
                    
                    
//                    var firstError = Sizzle('.validation-failed', this.form)[0];
//                    firstError.focus()
                    
//                    getFormElements(this.form).findAll(function(elm){
//                        return Sizzle(elm).hasClassName('validation-failed');
//                    }).first().focus();
                }
                this.options.onFormValidate(result, this.form);
                return result;
            },
            validateElm : function(elm, options){                
                options = PhonyPrototypeJs.extendObject({
                    useTitle : false,
                    onElementValidate : function(result, elm) {}
                }, options || {});
                
                var cn = PhonyPrototypeJs.classNamesList(elm);
                var result = PhonyPrototypeJs.all( PhonyPrototypeJs.collect( cn, function(value) {
                    var test = ValidationObj.test(value,elm,options.useTitle);                    
                    options.onElementValidate(test, elm);
                    return test;
                }));
                return result;
            },
            reset : function() {
                PhonyPrototypeJs.iterate(PhonyPrototypeJs.getFormElements(this.form),ValidationObj.reset);
            },
            
            test : function(name, elm, useTitle) {
                var v = ValidationObj.get(name);
                var prop = '__advice'+name;//camelize();
                try {                    
                    if(ValidationObj.isVisible(elm) && !v.test(elm.value, elm)) {
                        console.log("VALIDATION FAILED");
                        
                        if(!elm[prop]) {
                            var advice = ValidationObj.getAdvice(name, elm);
                            if(advice === null || typeof advice =="undefined") {
                                console.log("no advice");
                                var errorMsg = useTitle ? ((elm && elm.title) ? elm.title : v.error) : v.error;
                                
                                advice = document.createElement("div");
                                advice.className='validation-advice';
                                advice.id= 'advice-' + name + '-' + ValidationObj.getElmID(elm);
                                advice.style="display:none";
                                advice.innerHTML=errorMsg;
                                switch (elm.type.toLowerCase()) {
                                    case 'checkbox':
                                    case 'radio':
                                        var p = elm.parentNode;
                                        if(p) {
                                            p.appendChild(advice);
                                            //new Insertion.Bottom(p, advice);
                                        } else {
                                            elm.appendChild(advice);
                                            //new Insertion.After(elm, advice);
                                        }
                                        break;
                                    default:
                                        elm.parentNode.insertBefore(advice,elm);
                                        console.log("out");
                                }
                            }

                            if(typeof Effect == 'undefined') {
                                advice.style.display = 'block';
                            } else {
                                new Effect.Appear(advice, {
                                    duration : 1
                                });
                            }
                        }
                        elm[prop] = true;
                        PhonyPrototypeJs.removeClassName(elm, 'validation-passed');
                        PhonyPrototypeJs.addClassName(elm, 'validation-failed');
                        return false;
                    } else {
                        var advice = ValidationObj.getAdvice(name, elm);
                        if(advice != null) advice.hide();
                        elm[prop] = '';
                        PhonyPrototypeJs.removeClassName(elm, 'validation-failed');
                        PhonyPrototypeJs.addClassName(elm,'validation-passed');
                        return true;
                    }
                } catch(e) {
                    throw(e);
                }
            },
            isVisible : function(elm) {
                while(elm.tagName != 'BODY') {
                    if(!PhonyPrototypeJs.visible(elm)) return false;
                    elm = elm.parentNode;
                }
                return true;
            },
            getAdvice : function(name, elm) {
                return document.getElementById('advice-' + name + '-' + ValidationObj.getElmID(elm)) || document.getElementById('advice-' + ValidationObj.getElmID(elm));
            },
            getElmID : function(elm) {
                return elm.id ? elm.id : elm.name;
            },
            reset : function(elm) {
                elm = document.getElementById(elm);
                var cn = elm.classNames();
                PhonyPrototypeJs.iterate(cn,function(value) {
                    var prop = '__advice'+value.camelize();
                    if(elm[prop]) {
                        var advice = ValidationObj.getAdvice(value, elm);
                        advice.hide();
                        elm[prop] = '';
                    }
                    PhonyPrototypeJs.removeClassName(elm,'validation-failed');
                    PhonyPrototypeJs.removeClassName(elm,'validation-passed');
                });
            },
            add : function(className, error, test, options) {
                var nv = {};
                nv[className] = Validator(className, error, test, options);
                PhonyPrototypeJs.extendObject(ValidationObj.methods, nv);
            },
            addAllThese : function(validators) {
                var nv = {};
                PhonyPrototypeJs.iterate(validators, function(value) {
                    nv[ value[0] ] = Validator(value[0], value[1], value[2], (value.length > 3 ? value[3] : {}));
                });
                PhonyPrototypeJs.extendObject(ValidationObj.methods, nv);
            },
            get : function(name) {
                return  ValidationObj.methods[name] ? ValidationObj.methods[name] : ValidationObj.methods['_LikeNoIDIEverSaw_'];
            },
            methods : {
                '_LikeNoIDIEverSaw_' : Validator('_LikeNoIDIEverSaw_','',{})
            }
        
        }
    })();
    
    
    ValidationObj.add('IsEmpty', '', function(v) {
        return  ((v == null) || (v.length == 0)); // || /^\s+$/.test(v));
    });

    ValidationObj.addAllThese([
        ['required', 'This is a required field.', function(v) {
            return !ValidationObj.get('IsEmpty').test(v);
        }],
        ['validate-number', 'Please enter a valid number in this field.', function(v) {
            return ValidationObj.get('IsEmpty').test(v) || (!isNaN(v) && !/^\s+$/.test(v));
        }],
        ['validate-digits', 'Please use numbers only in this field. please avoid spaces or other characters such as dots or commas.', function(v) {
            return ValidationObj.get('IsEmpty').test(v) ||  !/[^\d]/.test(v);
        }],
        ['validate-alpha', 'Please use letters only (a-z) in this field.', function (v) {
            return ValidationObj.get('IsEmpty').test(v) ||  /^[a-zA-Z]+$/.test(v)
        }],
        ['validate-alphanum', 'Please use only letters (a-z) or numbers (0-9) only in this field. No spaces or other characters are allowed.', function(v) {
            return ValidationObj.get('IsEmpty').test(v) ||  !/\W/.test(v)
        }],
        ['validate-date', 'Please enter a valid date.', function(v) {
            //var test = new Date(v);
            //return ValidationObj.get('IsEmpty').test(v) || !isNaN(test);
            if(ValidationObj.get('IsEmpty').test(v)) return true;
            var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            if(!regex.test(v)) return false;
            var d = new Date(v);
            return ( parseInt(RegExp.$2, 10) == (1+d.getMonth()) ) && 
            (parseInt(RegExp.$1, 10) == d.getDate()) && 
            (parseInt(RegExp.$3, 10) == d.getFullYear() );
        }],
        ['validate-email', 'Please enter a valid email address. For example fred@domain.com .', function (v) {
            return ValidationObj.get('IsEmpty').test(v) || /\w{1,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/.test(v)
        }],
        ['validate-url', 'Please enter a valid URL.', function (v) {
            return ValidationObj.get('IsEmpty').test(v) || /^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i.test(v)
        }],
        ['validate-date-au', 'Please use this date format: dd/mm/yyyy. For example 17/03/2006 for the 17th of March, 2006.', function(v) {
            if(ValidationObj.get('IsEmpty').test(v)) return true;
            var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            if(!regex.test(v)) return false;
            var d = new Date(v.replace(regex, '$2/$1/$3'));
            return ( parseInt(RegExp.$2, 10) == (1+d.getMonth()) ) && 
            (parseInt(RegExp.$1, 10) == d.getDate()) && 
            (parseInt(RegExp.$3, 10) == d.getFullYear() );
        }],
        ['validate-currency-dollar', 'Please enter a valid $ amount. For example $100.00 .', function(v) {
            // [$]1[##][,###]+[.##]
            // [$]1###+[.##]
            // [$]0.##
            // [$].##
            return ValidationObj.get('IsEmpty').test(v) ||  /^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/.test(v)
        }],
        ['validate-selection', 'Please make a selection', function(v,elm){
            return elm.options ? elm.selectedIndex > 0 : !ValidationObj.get('IsEmpty').test(v);
        }],
        ['validate-one-required', 'Please select one of the above options.', function (v,elm) {
            var p = elm.parentNode;
            var options = p.getElementsByTagName('INPUT');
            return PhonyPrototypeJs.any( options, function(elm) {
                return elem.value;
            });
        }]
    ]);
            
    
    var Validation = function(form, options){
        ValidationObj.init(form, options);
        return ValidationObj;
    };
    
    window.Validation = Validation;
})();

})();