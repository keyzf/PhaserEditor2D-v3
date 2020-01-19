namespace phasereditor2d.scene.ui.sceneobjects {

    export class TranslateTool extends BaseObjectTool {

        static ID = "phasereditor2d.scene.ui.sceneobjects.TranslateTool";

        constructor() {
            super(TranslateTool.ID, TransformComponent.x, TransformComponent.y);

            const x = new TranslateToolItem("x");
            const y = new TranslateToolItem("y");
            const xy = new TranslateToolItem("xy");

            this.addItems(
                new editor.tools.LineToolItem("#f00", xy, x),
                new editor.tools.LineToolItem("#0f0", xy, y),
                xy,
                x,
                y
            );
        }
    }
}