/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/exec_script.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/exec_script.ts":
/*!****************************!*\
  !*** ./src/exec_script.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

(() => {
    var itemSetKey;
    function findReact(dom) {
        let key = Object.keys(dom).find(key => key.startsWith('__reactInternalInstance$'));
        let internalInstance = dom[key];
        if (internalInstance == null)
            return null;
        if (internalInstance.return) { // react 16+
            return internalInstance._debugOwner
                ? internalInstance._debugOwner.stateNode
                : internalInstance.return.stateNode;
        }
        else { // react <16
            return internalInstance._currentElement._owner._instance;
        }
    }
    window.addEventListener('message', (event) => {
        if (event.origin !== location.origin || !event.data || event.data.name !== 'column_formatting') {
            return;
        }
        if (event.data.type === 'refresh_preview') {
            applyFormatting(event.data.fieldInternalName, event.data.jsonFormatting);
        }
    });
    function findItemSet(reactNode) {
        if (!reactNode) {
            return null;
        }
        if (reactNode && reactNode.return && reactNode.return.stateNode && reactNode.return.stateNode.props
            && (reactNode.return.stateNode.props.resources)) {
            return reactNode.return.stateNode;
        }
        return findItemSet(reactNode.return);
    }
    function applyFormatting(fieldInternalName, json) {
        let reactNode = findReact(document.querySelectorAll('.root-100')[0]);
        let stateNode = findItemSet(reactNode._reactInternalFiber);
        console.log(fieldInternalName);
        console.log(json);
        console.log(stateNode.props.resources.consume(itemSetKey).peek());
        var items = stateNode.props.resources.consume(itemSetKey).peek();
        var schema = items.schema.peek();
        for (let i = 0; i < schema.length; i++) {
            const fieldInfo = schema[i];
            if (fieldInfo && fieldInfo.internalName === fieldInternalName) {
                var newSchema = schema.slice(0, i).concat(Object.assign({}, fieldInfo, {
                    customFormatter: JSON.stringify(json)
                }), schema.slice(i + 1));
                items.schema(newSchema);
                items.schema.valueHasMutated();
                break;
            }
        }
    }
    require(['a', 'eE'], function (data, eE) {
        window.CustomFormatter = data.CustomFormatter;
        console.log(eE);
        itemSetKey = eE.currentItemSet;
        window.postMessage({ loaded: true, type: 'init', name: 'column_formatting' }, "*");
    }, function (err) {
        console.error('Error loading SharePoint Column Formatter: ');
        console.error(err);
    });
})();


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V4ZWNfc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsbUJBQW1CO0FBQzFDO0FBQ0E7QUFDQSwwRUFBMEU7QUFDMUU7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxPQUF1QjtBQUMzQjtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsd0RBQXdEO0FBQ3BGLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUMiLCJmaWxlIjoiZXhlY19zY3JpcHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9leGVjX3NjcmlwdC50c1wiKTtcbiIsIigoKSA9PiB7XHJcbiAgICB2YXIgaXRlbVNldEtleTtcclxuICAgIGZ1bmN0aW9uIGZpbmRSZWFjdChkb20pIHtcclxuICAgICAgICBsZXQga2V5ID0gT2JqZWN0LmtleXMoZG9tKS5maW5kKGtleSA9PiBrZXkuc3RhcnRzV2l0aCgnX19yZWFjdEludGVybmFsSW5zdGFuY2UkJykpO1xyXG4gICAgICAgIGxldCBpbnRlcm5hbEluc3RhbmNlID0gZG9tW2tleV07XHJcbiAgICAgICAgaWYgKGludGVybmFsSW5zdGFuY2UgPT0gbnVsbClcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgaWYgKGludGVybmFsSW5zdGFuY2UucmV0dXJuKSB7IC8vIHJlYWN0IDE2K1xyXG4gICAgICAgICAgICByZXR1cm4gaW50ZXJuYWxJbnN0YW5jZS5fZGVidWdPd25lclxyXG4gICAgICAgICAgICAgICAgPyBpbnRlcm5hbEluc3RhbmNlLl9kZWJ1Z093bmVyLnN0YXRlTm9kZVxyXG4gICAgICAgICAgICAgICAgOiBpbnRlcm5hbEluc3RhbmNlLnJldHVybi5zdGF0ZU5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgeyAvLyByZWFjdCA8MTZcclxuICAgICAgICAgICAgcmV0dXJuIGludGVybmFsSW5zdGFuY2UuX2N1cnJlbnRFbGVtZW50Ll9vd25lci5faW5zdGFuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICBpZiAoZXZlbnQub3JpZ2luICE9PSBsb2NhdGlvbi5vcmlnaW4gfHwgIWV2ZW50LmRhdGEgfHwgZXZlbnQuZGF0YS5uYW1lICE9PSAnY29sdW1uX2Zvcm1hdHRpbmcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEudHlwZSA9PT0gJ3JlZnJlc2hfcHJldmlldycpIHtcclxuICAgICAgICAgICAgYXBwbHlGb3JtYXR0aW5nKGV2ZW50LmRhdGEuZmllbGRJbnRlcm5hbE5hbWUsIGV2ZW50LmRhdGEuanNvbkZvcm1hdHRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgZnVuY3Rpb24gZmluZEl0ZW1TZXQocmVhY3ROb2RlKSB7XHJcbiAgICAgICAgaWYgKCFyZWFjdE5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWFjdE5vZGUgJiYgcmVhY3ROb2RlLnJldHVybiAmJiByZWFjdE5vZGUucmV0dXJuLnN0YXRlTm9kZSAmJiByZWFjdE5vZGUucmV0dXJuLnN0YXRlTm9kZS5wcm9wc1xyXG4gICAgICAgICAgICAmJiAocmVhY3ROb2RlLnJldHVybi5zdGF0ZU5vZGUucHJvcHMucmVzb3VyY2VzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVhY3ROb2RlLnJldHVybi5zdGF0ZU5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmaW5kSXRlbVNldChyZWFjdE5vZGUucmV0dXJuKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGFwcGx5Rm9ybWF0dGluZyhmaWVsZEludGVybmFsTmFtZSwganNvbikge1xyXG4gICAgICAgIGxldCByZWFjdE5vZGUgPSBmaW5kUmVhY3QoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJvb3QtMTAwJylbMF0pO1xyXG4gICAgICAgIGxldCBzdGF0ZU5vZGUgPSBmaW5kSXRlbVNldChyZWFjdE5vZGUuX3JlYWN0SW50ZXJuYWxGaWJlcik7XHJcbiAgICAgICAgY29uc29sZS5sb2coZmllbGRJbnRlcm5hbE5hbWUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGpzb24pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHN0YXRlTm9kZS5wcm9wcy5yZXNvdXJjZXMuY29uc3VtZShpdGVtU2V0S2V5KS5wZWVrKCkpO1xyXG4gICAgICAgIHZhciBpdGVtcyA9IHN0YXRlTm9kZS5wcm9wcy5yZXNvdXJjZXMuY29uc3VtZShpdGVtU2V0S2V5KS5wZWVrKCk7XHJcbiAgICAgICAgdmFyIHNjaGVtYSA9IGl0ZW1zLnNjaGVtYS5wZWVrKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY2hlbWEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZmllbGRJbmZvID0gc2NoZW1hW2ldO1xyXG4gICAgICAgICAgICBpZiAoZmllbGRJbmZvICYmIGZpZWxkSW5mby5pbnRlcm5hbE5hbWUgPT09IGZpZWxkSW50ZXJuYWxOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3U2NoZW1hID0gc2NoZW1hLnNsaWNlKDAsIGkpLmNvbmNhdChPYmplY3QuYXNzaWduKHt9LCBmaWVsZEluZm8sIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXN0b21Gb3JtYXR0ZXI6IEpTT04uc3RyaW5naWZ5KGpzb24pXHJcbiAgICAgICAgICAgICAgICB9KSwgc2NoZW1hLnNsaWNlKGkgKyAxKSk7XHJcbiAgICAgICAgICAgICAgICBpdGVtcy5zY2hlbWEobmV3U2NoZW1hKTtcclxuICAgICAgICAgICAgICAgIGl0ZW1zLnNjaGVtYS52YWx1ZUhhc011dGF0ZWQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgX19ub25fd2VicGFja19yZXF1aXJlX18oWydhJywgJ2VFJ10sIGZ1bmN0aW9uIChkYXRhLCBlRSkge1xyXG4gICAgICAgIHdpbmRvdy5DdXN0b21Gb3JtYXR0ZXIgPSBkYXRhLkN1c3RvbUZvcm1hdHRlcjtcclxuICAgICAgICBjb25zb2xlLmxvZyhlRSk7XHJcbiAgICAgICAgaXRlbVNldEtleSA9IGVFLmN1cnJlbnRJdGVtU2V0O1xyXG4gICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7IGxvYWRlZDogdHJ1ZSwgdHlwZTogJ2luaXQnLCBuYW1lOiAnY29sdW1uX2Zvcm1hdHRpbmcnIH0sIFwiKlwiKTtcclxuICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBsb2FkaW5nIFNoYXJlUG9pbnQgQ29sdW1uIEZvcm1hdHRlcjogJyk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgfSk7XHJcbn0pKCk7XHJcbiJdLCJzb3VyY2VSb290IjoiIn0=