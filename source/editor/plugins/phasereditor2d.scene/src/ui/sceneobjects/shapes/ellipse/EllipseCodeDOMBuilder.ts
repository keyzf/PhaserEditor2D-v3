namespace phasereditor2d.scene.ui.sceneobjects {

    import code = core.code;

    export class EllipseCodeDOMBuilder extends BaseImageCodeDOMBuilder {

        constructor() {
            super("ellipse");
        }

        buildCreatePrefabInstanceCodeDOM(args: IBuildPrefabConstructorCodeDOMArgs) {

            args.methodCallDOM.arg(args.sceneExpr);

            this.buildCreatePrefabInstanceCodeDOM_XY_Arguments(args);
            this.buildCreatePrefabInstanceCodeDOM_Size_Arguments(args);
        }

        buildPrefabConstructorDeclarationCodeDOM(args: IBuildPrefabConstructorDeclarationCodeDOM): void {

            const ctr = args.ctrDeclCodeDOM;

            ctr.arg("x", "number", true);
            ctr.arg("y", "number", true);
            ctr.arg("width", "number", true);
            ctr.arg("height", "number", true);
        }

        buildPrefabConstructorDeclarationSupperCallCodeDOM(
            args: IBuildPrefabConstructorDeclarationSupperCallCodeDOMArgs): void {

            const obj = args.prefabObj as TileSprite;
            const support = obj.getEditorSupport();

            const call = args.superMethodCallCodeDOM;

            this.buildPrefabConstructorDeclarationSupperCallCodeDOM_XYParameters(args);

            if (support.isUnlockedProperty(SizeComponent.width)) {

                call.arg("typeof width === \"number\" ? width : " + obj.width);
                call.arg("typeof height === \"number\" ? height : " + obj.height);

            } else {

                call.arg("width");
                call.arg("height");
            }
        }

        buildCreateObjectWithFactoryCodeDOM(args: IBuildObjectFactoryCodeDOMArgs): code.MethodCallCodeDOM {

            const obj = args.obj as TileSprite;
            const call = new code.MethodCallCodeDOM("ellipse", args.gameObjectFactoryExpr);

            call.argFloat(obj.x);
            call.argFloat(obj.y);
            call.argFloat(obj.width);
            call.argFloat(obj.height);

            return call;
        }
    }
}