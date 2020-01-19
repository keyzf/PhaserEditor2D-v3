
namespace phasereditor2d.scene.ui {

    import controls = colibri.ui.controls;
    import ide = colibri.ui.ide;
    import io = colibri.core.io;
    import json = core.json;
    import FileUtils = colibri.ui.ide.FileUtils;

    export class SceneMaker {

        private _scene: Scene;
        private _packFinder: pack.core.PackFinder;

        constructor(scene: Scene) {
            this._scene = scene;
            this._packFinder = new pack.core.PackFinder();
        }

        static acceptDropFile(dropFile: io.FilePath, editorFile: io.FilePath) {

            if (dropFile.getFullName() === editorFile.getFullName()) {

                return false;
            }

            const sceneFinder = ScenePlugin.getInstance().getSceneFinder();

            const sceneData = sceneFinder.getSceneData(dropFile);

            if (sceneData) {

                if (sceneData.sceneType !== core.json.SceneType.PREFAB) {

                    return false;
                }

                if (sceneData.displayList.length === 0) {

                    return false;
                }

                const objData = sceneData.displayList[0];

                if (objData.prefabId) {

                    const prefabFile = sceneFinder.getPrefabFile(objData.prefabId);

                    if (prefabFile) {

                        return this.acceptDropFile(prefabFile, editorFile);
                    }
                }

                return true;
            }

            return false;
        }

        static isValidSceneDataFormat(data: json.SceneData) {
            return "displayList" in data && Array.isArray(data.displayList);
        }

        getPackFinder() {
            return this._packFinder;
        }

        async preload() {

            await this._packFinder.preload();

            const list = this._scene.textures.list;

            for (const key in this._scene.textures.list) {

                if (key === "__DEFAULT" || key === "__MISSING") {

                    continue;
                }

                if (list.hasOwnProperty(key)) {

                    const texture = list[key];

                    texture.destroy();

                    delete list[key];
                }
            }
        }

        async buildDependenciesHash() {

            const builder = new phasereditor2d.ide.core.MultiHashBuilder();

            for (const obj of this._scene.getDisplayListChildren()) {

                await obj.getEditorSupport().buildDependencyHash({ builder });
            }

            const cache = this._scene.getPackCache();

            const files = new Set<io.FilePath>();

            for (const asset of cache.getAssets()) {

                files.add(asset.getPack().getFile());

                asset.computeUsedFiles(files);
            }

            for (const file of files) {

                builder.addPartialFileToken(file);
            }

            const hash = builder.build();

            return hash;
        }

        isPrefabFile(file: io.FilePath) {

            const ct = colibri.Platform.getWorkbench().getContentTypeRegistry().getCachedContentType(file);

            if (ct === core.CONTENT_TYPE_SCENE) {

                const finder = ScenePlugin.getInstance().getSceneFinder();

                const data = finder.getSceneData(file);

                return data && data.sceneType === json.SceneType.PREFAB;
            }

            return false;
        }

        async createPrefabInstanceWithFile(file: io.FilePath) {

            const content = await FileUtils.preloadAndGetFileString(file);

            if (!content) {
                return null;
            }

            try {

                const prefabData = JSON.parse(content) as json.SceneData;

                const obj = this.createObject({
                    id: Phaser.Utils.String.UUID(),
                    prefabId: prefabData.id,
                    label: "temporal"
                });

                return obj;

            } catch (e) {

                console.error(e);

                return null;
            }
        }

        getSerializer(data: json.IObjectData) {
            return new json.Serializer(data);
        }

        createScene(sceneData: json.SceneData) {

            if (sceneData.settings) {

                this._scene.getSettings().readJSON(sceneData.settings);
            }

            this._scene.setSceneType(sceneData.sceneType);

            // removes this condition, it is used temporal for compatibility
            this._scene.setId(sceneData.id);

            for (const objData of sceneData.displayList) {

                this.createObject(objData);
            }
        }

        async updateSceneLoader(sceneData: json.SceneData) {

            const finder = new pack.core.PackFinder();

            await finder.preload();

            for (const objData of sceneData.displayList) {

                const ser = this.getSerializer(objData);

                const type = ser.getType();

                const ext = ScenePlugin.getInstance().getObjectExtensionByObjectType(type);

                if (ext) {

                    const assets = await ext.getAssetsFromObjectData({
                        serializer: ser,
                        finder: finder,
                        scene: this._scene
                    });

                    for (const asset of assets) {

                        const updater = ScenePlugin.getInstance().getLoaderUpdaterForAsset(asset);

                        if (updater) {

                            await updater.updateLoader(this._scene, asset);
                        }
                    }
                }
            }
        }

        createEmptyObject(ext: sceneobjects.SceneObjectExtension) {

            const canvas = this._scene.game.canvas;

            let x = canvas.width / 2;
            let y = canvas.height / 2;

            const worldPoint = this._scene.getCamera().getWorldPoint(x, y);

            x = Math.floor(worldPoint.x);
            y = Math.floor(worldPoint.y);

            const newObject = ext.createEmptySceneObject({
                scene: this._scene,
                x: x,
                y: y,
            });

            const nameMaker = new ide.utils.NameMaker(obj => {
                return (obj as sceneobjects.ISceneObject).getEditorSupport().getLabel();
            });

            this._scene.visit(obj => nameMaker.update([obj]));

            newObject.getEditorSupport().setLabel(nameMaker.makeName(ext.getTypeName().toLowerCase()));

            return newObject;
        }

        createObject(data: json.IObjectData) {

            const ser = this.getSerializer(data);

            const type = ser.getType();

            const ext = ScenePlugin.getInstance().getObjectExtensionByObjectType(type);

            if (ext) {

                const sprite = ext.createSceneObjectWithData({
                    data: data,
                    scene: this._scene
                });

                return sprite;

            } else {

                console.error(`SceneMaker: no extension is registered for type "${type}".`);
            }

            return null;
        }
    }
}