namespace phasereditor2d.scene.ui.editor.usercomponent {

    import controls = colibri.ui.controls;

    export class UserComponentSection extends controls.properties.PropertySection<UserComponent> {

        constructor(page: controls.properties.PropertyPage) {
            super(page, "phasereditor2d.scene.ui.editor.usercomponent.UserComponentSection", "Component", false, false);
        }

        hasMenu() {

            return true;
        }

        createMenu(menu: controls.Menu) {

            ide.IDEPlugin.getInstance().createHelpMenuItem(menu, "scene-editor/user-components-editor-edit-component.html");
        }

        createForm(parent: HTMLDivElement) {

            const comp = this.createGridElement(parent, 3);
            comp.style.gridTemplateColumns = "auto 1fr auto";

            {
                // Name

                const text = this.stringProp(comp, "Name", "Name",
                    "Name of the component. In the compiled code, it is used as file name and class name.");

                this.addUpdater(() => {

                    text.readOnly = this.getSelection().length > 1;
                });
            }

            this.stringProp(comp, "GameObjectType", "Game Object Type",
                "Name of the type of the Game Object that this component can be added on.", () => this.createGameObjectTypeOptions());

            this.stringProp(comp, "BaseClass", "Super Class", "Name of the super class of the component. It is optional.", () => this.createSuperClassOptions());

            this.booleanProp(comp,
                "ListenStart", "Listen Start Event", "Listen the `start()` event. Requires `UserComponent` as super-class.");

            this.booleanProp(comp,
                "ListenUpdate", "Listen Update Event", "Listen the `update()` event. Requires `UserComponent` as super-class.");

            this.booleanProp(comp,
                "ListenDestroy", "Listen Destroy Event",
                "Listen the `destroy()` event. Fired when the game object is destroyed. Requires `UserComponent` as super-class.");
        }

        private createSuperClassOptions(): string[] {

            const options = new Set(ScenePlugin.getInstance().getSceneFinder()
                .getUserComponentsModels()
                .flatMap(model => model.model.getComponents())
                .map(comp => comp.getBaseClass())
                .filter(name => name !== undefined && name !== null && name.trim().length > 0));

            options.delete("UserComponent");

            return ["UserComponent", ...([...options].sort())];
        }

        private createGameObjectTypeOptions(): string[] {

            const options = new Set(ScenePlugin.getInstance().getSceneFinder()
                .getUserComponentsModels()
                .flatMap(model => model.model.getComponents())
                .map(comp => comp.getGameObjectType()));

            for (const option of ScenePlugin.getInstance()
                .getGameObjectExtensions()
                .map(e => e.getPhaserTypeName())) {

                options.add(option);
            }

            return [...options].sort();
        }

        private stringProp(comp: HTMLElement, prop: string, propName: string, propHelp: string, options?: () => string[]) {

            this.createLabel(comp, propName, propHelp);

            const text = this.createText(comp);

            text.addEventListener("change", e => {

                this.getEditor().runOperation(() => {

                    for (const comp1 of this.getSelection()) {

                        comp1["set" + prop](text.value);
                    }
                });
            });

            this.addUpdater(() => {

                text.value = this.flatValues_StringOneOrNothing(
                    this.getSelection().map(c => c["get" + prop]()));
            });

            if (options) {

                const btn = new controls.IconControl(colibri.ColibriPlugin.getInstance().getIcon(colibri.ICON_CONTROL_TREE_COLLAPSE), true);
                btn.getCanvas().style.alignSelf = "center";
                comp.appendChild(btn.getCanvas());

                btn.getCanvas().addEventListener("click", e => {

                    const menu = new controls.Menu();

                    for (const option of options()) {

                        menu.addAction({
                            text: option,
                            callback: () => {

                                text.value = option;

                                this.getEditor().runOperation(() => {

                                    for (const comp1 of this.getSelection()) {

                                        comp1["set" + prop](text.value);
                                    }
                                });
                            }
                        });
                    }

                    menu.createWithEvent(e, true);
                });

            } else {

                text.style.gridColumn = "2 / span 2";
            }

            return text;
        }

        private booleanProp(comp: HTMLElement, prop: string, propName: string, propHelp: string) {

            const checkbox = this.createCheckbox(comp, this.createLabel(comp, propName, propHelp));
            checkbox.style.gridColumn = "2 / span 2";

            checkbox.addEventListener("change", e => {

                this.getEditor().runOperation(() => {

                    for (const comp1 of this.getSelection()) {

                        comp1["set" + prop](checkbox.checked);
                    }
                });
            });

            this.addUpdater(() => {

                checkbox.checked = this.flatValues_BooleanAnd(
                    this.getSelection().map(c => c["is" + prop]()));
            });

            return checkbox;
        }

        getEditor() {

            return colibri.Platform.getWorkbench()
                .getActiveWindow().getEditorArea()
                .getSelectedEditor() as UserComponentsEditor;
        }

        canEdit(obj: any, n: number): boolean {

            return obj instanceof UserComponent;
        }

        canEditNumber(n: number): boolean {

            return n > 0;
        }
    }
}