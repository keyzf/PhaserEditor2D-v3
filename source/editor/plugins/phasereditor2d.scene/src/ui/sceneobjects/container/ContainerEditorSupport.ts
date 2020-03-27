namespace phasereditor2d.scene.ui.sceneobjects {

    import controls = colibri.ui.controls;
    import json = core.json;

    export interface IContainerData extends json.IObjectData {
        list: json.IObjectData[];
    }

    export class ContainerEditorSupport extends EditorSupport<Container> {

        private _allowPickChildren: boolean;

        constructor(obj: Container, scene: Scene) {
            super(ContainerExtension.getInstance(), obj, scene);

            this._allowPickChildren = true;

            this.addComponent(new TransformComponent(obj));
            this.addComponent(new ContainerComponent(obj));
        }

        isAllowPickChildren() {
            return this._allowPickChildren;
        }

        setAllowPickChildren(childrenPickable: boolean) {
            this._allowPickChildren = childrenPickable;
        }

        setInteractive() {
            // nothing
        }

        destroy() {

            for (const obj of this.getObject().list) {

                obj.getEditorSupport().destroy();
            }

            super.destroy();
        }

        async buildDependencyHash(args: IBuildDependencyHashArgs) {

            super.buildDependencyHash(args);

            if (!this.isPrefabInstance()) {

                for (const obj of this.getObject().list) {

                    obj.getEditorSupport().buildDependencyHash(args);
                }
            }
        }

        getCellRenderer(): colibri.ui.controls.viewers.ICellRenderer {

            if (this.isPrefabInstance()) {

                const finder = ScenePlugin.getInstance().getSceneFinder();

                const file = finder.getPrefabFile(this.getPrefabId());

                if (file) {

                    const image = SceneThumbnailCache.getInstance().getContent(file);

                    if (image) {

                        return new controls.viewers.ImageCellRenderer(image);
                    }
                }
            }

            return new controls.viewers.IconImageCellRenderer(ScenePlugin.getInstance().getIcon(ICON_GROUP));
        }

        writeJSON(containerData: IContainerData) {

            super.writeJSON(containerData);

            if (!this.isPrefabInstance()) {

                containerData.list = this.getObject().list.map(obj => {

                    const objData = {} as json.IObjectData;

                    obj.getEditorSupport().writeJSON(objData);

                    return objData as json.IObjectData;
                });
            }
        }

        readJSON(containerData: IContainerData) {

            super.readJSON(containerData);

            const ser = this.getSerializer(containerData);

            const list = ser.read("list", []) as json.IObjectData[];

            const maker = this.getScene().getMaker();

            const container = this.getObject();

            container.removeAll(true);

            for (const objData of list) {

                const sprite = maker.createObject(objData);

                container.add(sprite);
            }
        }

        getScreenBounds(camera: Phaser.Cameras.Scene2D.Camera) {

            const container = this.getObject();

            if (container.list.length === 0) {
                return [];
            }

            const minPoint = new Phaser.Math.Vector2(Number.MAX_VALUE, Number.MAX_VALUE);
            const maxPoint = new Phaser.Math.Vector2(Number.MIN_VALUE, Number.MIN_VALUE);

            const points: Phaser.Math.Vector2[] = [];

            for (const obj of container.list) {

                const bounds = obj.getEditorSupport().getScreenBounds(camera);

                points.push(...bounds);

            }

            const p = camera.getScreenPoint(container.x, container.y);

            points.push(p);

            for (const point of points) {

                minPoint.x = Math.min(minPoint.x, point.x);
                minPoint.y = Math.min(minPoint.y, point.y);
                maxPoint.x = Math.max(maxPoint.x, point.x);
                maxPoint.y = Math.max(maxPoint.y, point.y);
            }

            return [
                new Phaser.Math.Vector2(minPoint.x, minPoint.y),
                new Phaser.Math.Vector2(maxPoint.x, minPoint.y),
                new Phaser.Math.Vector2(maxPoint.x, maxPoint.y),
                new Phaser.Math.Vector2(minPoint.x, maxPoint.y)
            ];
        }

        trim() {

            const container = this.getObject();

            if (container.length === 0) {

                return;
            }

            let minX = Number.MAX_VALUE;
            let minY = Number.MAX_VALUE;

            for (const child of container.list) {

                const sprite = child as unknown as Phaser.GameObjects.Sprite;

                minX = Math.min(sprite.x, minX);
                minY = Math.min(sprite.y, minY);
            }

            for (const child of container.list) {

                const sprite = child as unknown as Phaser.GameObjects.Sprite;

                sprite.x -= minX;
                sprite.y -= minY;
            }

            const p = new Phaser.Math.Vector2(0, 0);

            container.getWorldTransformMatrix().transformPoint(minX, minY, p);

            container.x += p.x;
            container.y += p.y;
        }
    }
}