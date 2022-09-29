namespace phasereditor2d.scene.ui.sceneobjects {

    export class ArcadeSpriteExtension extends BaseImageExtension {

        private static _instance = new ArcadeSpriteExtension();

        static getInstance() {

            return this._instance;
        }

        private constructor() {
            super({
                    typeName: "ArcadeSprite",
                    phaserTypeName: "Phaser.Physics.Arcade.Sprite",
                    category: SCENE_OBJECT_ARCADE_CATEGORY,
                    icon: ScenePlugin.getInstance().getIconDescriptor(ICON_SPRITE_TYPE)
            });
        }

        getCodeDOMBuilder(): ArcadeObjectCodeDOMBuilder {

            return new ArcadeObjectCodeDOMBuilder("sprite");
        }

        protected newObject(scene: Scene, x: number, y: number, key?: string, frame?: string | number): ISceneGameObject {

            return new ArcadeSprite(scene, x, y, key || null, frame);
        }
    }
}