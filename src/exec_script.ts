declare var __non_webpack_require__: any;

(() => {

    var itemSetKey;

    function findReact(dom) {
        let key = Object.keys(dom).find(key => key.startsWith('__reactInternalInstance$'));
        let internalInstance = dom[key];
        if (internalInstance == null) return null;

        if (internalInstance.return) { // react 16+
            return internalInstance._debugOwner
                ? internalInstance._debugOwner.stateNode
                : internalInstance.return.stateNode;
        } else { // react <16
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

    function findItemSet(reactNode: any): any {
        if (!reactNode) {
            return null;
        }

        if (reactNode && reactNode.return && reactNode.return.stateNode && reactNode.return.stateNode.props
            && (reactNode.return.stateNode.props.resources)) {
            return reactNode.return.stateNode;
        }

        return findItemSet(reactNode.return);
    }

    function applyFormatting(fieldInternalName: string, json: string) {
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

    __non_webpack_require__(['a', 'eE'], function (data, eE) {
        (window as any).CustomFormatter = data.CustomFormatter;
        console.log(eE);
        itemSetKey = eE.currentItemSet;
        window.postMessage({ loaded: true, type: 'init', name: 'column_formatting' }, "*");
    }, function (err) {
        console.error('Error loading SharePoint Column Formatter: ');
        console.error(err);
    });
})();
