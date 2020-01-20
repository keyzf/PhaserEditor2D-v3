namespace phasereditor2d.scene.ui.editor {

    import controls = colibri.ui.controls;

    export class AddObjectDialog extends controls.dialogs.ViewerDialog {

        private _editor: SceneEditor;

        constructor(editor: SceneEditor) {
            super(new controls.viewers.TreeViewer());

            this._editor = editor;
        }

        create() {

            const viewer = this.getViewer();

            viewer.setLabelProvider(new controls.viewers.LabelProvider(
                (ext: sceneobjects.SceneObjectExtension) => {
                    return ext.getTypeName();
                }));

            viewer.setContentProvider(new controls.viewers.ArrayTreeContentProvider());

            viewer.setCellRendererProvider(
                new controls.viewers.EmptyCellRendererProvider(
                    _ => new controls.viewers.IconImageCellRenderer(ScenePlugin.getInstance().getIcon(ICON_GROUP)))
            );

            viewer.setInput(ScenePlugin.getInstance().getObjectExtensions());

            super.create();

            this.style.width = "20em";

            this.setTitle("Add Object");

            const createObject = () => {

                const ext = viewer.getSelectionFirstElement() as sceneobjects.SceneObjectExtension;

                const obj = this._editor.getSceneMaker().createEmptyObject(ext);

                this._editor.setSelection([obj]);

                this._editor.getUndoManager().add(new undo.AddObjectsOperation(this._editor, [obj]));

                this.close();
            };

            viewer.getElement().addEventListener("dblclick", e => {

                if (viewer.getSelection().length === 1) {

                    createObject();
                }
            });

            const btn = this.addButton("Create", () => {

                createObject();
            });

            btn.disabled = true;

            viewer.addEventListener(controls.EVENT_SELECTION_CHANGED,
                e => btn.disabled = (viewer.getSelection().length !== 1));

            this.addButton("Cancel", () => this.close());
        }
    }
}