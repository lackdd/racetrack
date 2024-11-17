import {
  require_classnames,
  require_jsx_runtime,
  require_react,
  useBootstrapPrefix
} from "./chunk-G4OSKBYU.js";
import {
  __toESM
} from "./chunk-G3PMV62Z.js";

// ../node_modules/react-bootstrap/esm/FloatingLabel.js
var import_classnames = __toESM(require_classnames());
var React3 = __toESM(require_react());

// ../node_modules/react-bootstrap/esm/FormGroup.js
var React2 = __toESM(require_react());
var import_react = __toESM(require_react());

// ../node_modules/react-bootstrap/esm/FormContext.js
var React = __toESM(require_react());
var FormContext = React.createContext({});
var FormContext_default = FormContext;

// ../node_modules/react-bootstrap/esm/FormGroup.js
var import_jsx_runtime = __toESM(require_jsx_runtime());
var FormGroup = React2.forwardRef(({
  controlId,
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as: Component = "div",
  ...props
}, ref) => {
  const context = (0, import_react.useMemo)(() => ({
    controlId
  }), [controlId]);
  return (0, import_jsx_runtime.jsx)(FormContext_default.Provider, {
    value: context,
    children: (0, import_jsx_runtime.jsx)(Component, {
      ...props,
      ref
    })
  });
});
FormGroup.displayName = "FormGroup";
var FormGroup_default = FormGroup;

// ../node_modules/react-bootstrap/esm/FloatingLabel.js
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var FloatingLabel = React3.forwardRef(({
  bsPrefix,
  className,
  children,
  controlId,
  label,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, "form-floating");
  return (0, import_jsx_runtime3.jsxs)(FormGroup_default, {
    ref,
    className: (0, import_classnames.default)(className, bsPrefix),
    controlId,
    ...props,
    children: [children, (0, import_jsx_runtime2.jsx)("label", {
      htmlFor: controlId,
      children: label
    })]
  });
});
FloatingLabel.displayName = "FloatingLabel";
var FloatingLabel_default = FloatingLabel;

export {
  FormContext_default,
  FormGroup_default,
  FloatingLabel_default
};
//# sourceMappingURL=chunk-SPSBXBDJ.js.map
