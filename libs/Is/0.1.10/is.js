var Is = function (value) {
    return new jumpkick.Is(value);
};
var jumpkick;
(function (jumpkick) {
    var Is = (function () {
        function Is(value, inverse, property) {
            this.value = value;
            this.inverse = inverse;
            this.property = property;
            this.inverse = inverse || this.inverse;
            this.originalValue = value;
        }
        Object.defineProperty(Is.prototype, "not", {
            get: function () {
                this.inverse = true;
                return this;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Is.prototype, "a", {
            get: function () {
                return this;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Is.prototype, "and", {
            get: function () {
                return this;
            },
            enumerable: true,
            configurable: true
        });
        Is.prototype.isNot = function () {
            this.inverse = true;
            return this;
        };
        Is.prototype.isA = function () {
            return this;
        };
        Object.defineProperty(Is.prototype, "or", {
            get: function () {
                this.testingAny = true;
                return this;
            },
            enumerable: true,
            configurable: true
        });
        Is.prototype.nothing = function () {
            return (!this.value && !this.testingAny);
        };
        Is.prototype.matching = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (this.nothing()) {
                return this;
            }
            var yes = !this.inverse;
            for (var i = 0; i < args.length; i++) {
                var test = args[i];
                if (test.toString() == "NaN") {
                    if (!isNaN(this.getPropertyOrValue())) {
                        yes = this.inverse;
                    }
                }
                else if (typeof test == 'function') {
                    if (!args[i](this.getPropertyOrValue())) {
                        yes = this.inverse;
                    }
                }
                else if (test.indexOf("<") > -1 || test.indexOf(">") > -1) {
                    return this.checkForLengthOrCompareNumber(test);
                }
                else {
                    if (test) {
                        yes = this.equalTo(test).value ? !this.inverse : this.inverse;
                    }
                }
            }
            if (yes) {
                return this.getReturnedInstance(true);
            }
            else {
                return this.getReturnedInstance(false);
            }
        };
        Is.prototype.getReturnedInstance = function (valid) {
            if (!valid) {
                if (!this.testingAny)
                    this.value = null;
            }
            else {
                if (!this.value) {
                    this.value = this.originalValue;
                }
            }
            this.inverse = false;
            this.property = null;
            this.testingAny = false;
            return this;
        };
        Is.prototype.checkForLengthOrCompareNumber = function (test) {
            if (test.indexOf("<") > -1) {
                var testArray = test.split("<");
                if (testArray[0] == "")
                    return this.lessThan(parseInt(testArray[1]));
                if (testArray[0] == "length")
                    return this.shorterThan(parseInt(testArray[1]));
            }
            else if (test.indexOf(">") > -1) {
                var testArray = test.split(">");
                if (testArray[0] == "")
                    return this.greaterThan(parseInt(testArray[1]));
                if (testArray[0] == "length")
                    return this.longerThan(parseInt(testArray[1]));
            }
        };
        Is.prototype.matchingAny = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (this.nothing()) {
                return this;
            }
            var matches = 0;
            for (var i = 0; i < args.length; i++) {
                var test = args[i];
                if (test.toString() == "NaN") {
                    if (isNaN(this.getPropertyOrValue())) {
                        matches++;
                    }
                }
                else if (typeof test === 'function') {
                    if (args[i](this.getPropertyOrValue())) {
                        matches++;
                    }
                }
                else if (test.indexOf("<") > -1 || test.indexOf(">") > -1) {
                    if (this.checkForLengthOrCompareNumber(test).value) {
                        matches++;
                    }
                }
                else {
                    if (test) {
                        matches += this.equalTo(test).value ? 1 : 0;
                    }
                }
            }
            return (matches > 0 && !this.inverse) || (matches == 0 && this.inverse) ? this.getReturnedInstance(true) : this.getReturnedInstance(false);
        };
        Is.prototype.longerThan = function (val) {
            if (this.nothing()) {
                return this;
            }
            return (this.inverse ? this.getPropertyOrValue().toString().length < val ? this.getReturnedInstance(true) : this.getReturnedInstance(false) : this.getPropertyOrValue().toString().length > val ? this.getReturnedInstance(true) : this.getReturnedInstance(false));
        };
        Is.prototype.shorterThan = function (val) {
            if (this.nothing()) {
                return this;
            }
            return (this.inverse ? this.getPropertyOrValue().toString().length > val ? this.getReturnedInstance(true) : this.getReturnedInstance(false) : this.getPropertyOrValue().toString().length < val ? this.getReturnedInstance(true) : this.getReturnedInstance(false));
        };
        Is.prototype.equalTo = function (val) {
            if (this.nothing()) {
                return this;
            }
            return (this.inverse ? this.getPropertyOrValue() != val ? this.getReturnedInstance(true) : this.getReturnedInstance(false) : this.getPropertyOrValue() === val ? this.getReturnedInstance(true) : this.getReturnedInstance(false));
        };
        Is.prototype.numeric = function () {
            if (this.nothing()) {
                return this;
            }
            return (this.inverse ? typeof this.getPropertyOrValue() != "number" ? this.getReturnedInstance(true) : this.getReturnedInstance(false) : typeof this.getPropertyOrValue() == "number" ? this.getReturnedInstance(true) : this.getReturnedInstance(false));
        };
        Is.prototype.lessThan = function (val) {
            if (this.nothing()) {
                return this;
            }
            return (this.inverse ? this.getPropertyOrValue() >= val ? this.getReturnedInstance(true) : this.getReturnedInstance(false) : this.getPropertyOrValue() < val ? this.getReturnedInstance(true) : this.getReturnedInstance(false));
        };
        Is.prototype.greaterThan = function (val) {
            if (this.nothing()) {
                return this;
            }
            return (this.inverse ? this.getPropertyOrValue() <= val ? this.getReturnedInstance(true) : this.getReturnedInstance(false) : this.getPropertyOrValue() > val ? this.getReturnedInstance(true) : this.getReturnedInstance(false));
        };
        Is.prototype.contains = function (val) {
            if (this.nothing()) {
                return this;
            }
            if (!Array.isArray(this.getPropertyOrValue())) {
                return this;
            }
            return (this.inverse ? this.getPropertyOrValue().indexOf(val) == -1 ? this.getReturnedInstance(true) : this.getReturnedInstance(false) : this.getPropertyOrValue().indexOf(val) > -1 ? this.getReturnedInstance(true) : this.getReturnedInstance(false));
        };
        Is.prototype.emptyArray = function () {
            if (this.nothing()) {
                return this;
            }
            if (!Array.isArray(this.getPropertyOrValue())) {
                return this;
            }
            return (this.inverse ? this.getPropertyOrValue().length > 0 ? this.getReturnedInstance(true) : this.getReturnedInstance(false) : this.getPropertyOrValue().length == 0 ? this.getReturnedInstance(true) : this.getReturnedInstance(false));
        };
        Is.prototype.getPropertyOrValue = function () {
            if (this.testingAny) {
                return (this.property ? this.originalValue[this.property] : this.originalValue);
            }
            else {
                return (this.property ? this.value[this.property] : this.value);
            }
        };
        Is.prototype.prop = function (prop) {
            if (this.nothing()) {
                return this.getReturnedInstance(false);
            }
            if (!(this.testingAny ? this.originalValue[prop] : this.value[prop])) {
                return this.getReturnedInstance(false);
            }
            else {
                this.property = prop;
                return this;
            }
        };
        Is.prototype.then = function (func) {
            if (!this.value) {
                return this;
            }
            func();
            return new Is(this.value);
        };
        Is.prototype.catch = function (func) {
            if (!this.value) {
                func();
            }
            return new Is(this.value);
        };
        Is.prototype.finally = function (func) {
            func();
            return new Is(this.value);
        };
        return Is;
    })();
    jumpkick.Is = Is;
})(jumpkick || (jumpkick = {}));
//# sourceMappingURL=is.js.map