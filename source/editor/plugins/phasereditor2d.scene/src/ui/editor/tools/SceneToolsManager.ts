namespace phasereditor2d.scene.ui.editor.tools {

    export interface ISceneToolsState {

        selectedId: string;
    }

    export class SceneToolsManager {

        private _editor: SceneEditor;
        private _activeTool: SceneTool;
        private _tools: SceneTool[];

        constructor(editor: SceneEditor) {
            this._editor = editor;

            this._tools = ScenePlugin.getInstance().getTools();

            this.setActiveTool(this.findTool(sceneobjects.TranslateTool.ID));
        }

        setState(state: ISceneToolsState) {

            if (state) {

                const id = state.selectedId;

                const tool = this.findTool(id);

                if (tool) {

                    this.setActiveTool(tool);
                }
            }
        }

        getState(): ISceneToolsState {

            return {
                selectedId: this._activeTool ? this._activeTool.getId() : undefined
            };
        }

        findTool(toolId: string) {

            return this._tools.find(tool => tool.getId() === toolId);
        }

        getActiveTool() {
            return this._activeTool;
        }

        setActiveTool(tool: SceneTool) {

            this.updateAction(this._activeTool, false);
            this.updateAction(tool, true);

            this._activeTool = tool;

            this._editor.repaint();
        }

        private updateAction(tool: tools.SceneTool, selected: boolean) {

            if (tool) {

                const action = this._editor.getToolbarActionMap().get(tool.getId());

                if (action) {

                    action.setSelected(selected);
                }
            }
        }

        swapTool(toolId: string) {

            const tool = this.findTool(toolId);

            this.setActiveTool(tool === this._activeTool ? null : tool);
        }
    }
}