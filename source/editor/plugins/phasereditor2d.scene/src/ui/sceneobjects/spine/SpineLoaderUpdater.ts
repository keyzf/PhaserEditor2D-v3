namespace phasereditor2d.scene.ui.sceneobjects {

    export class SpineLoaderUpdater extends LoaderUpdaterExtension {

        clearCache(scene: BaseScene): void {

            const spineAtlasCache = scene.cache.custom["esotericsoftware.spine.atlas.cache"];
            const spineSkeletonCache = scene.cache.custom["esotericsoftware.spine.skeletonFile.cache"];

            const caches = [
                scene.cache.json,
                scene.cache.binary,
                spineAtlasCache,
                spineSkeletonCache];

            for (const cache of caches) {

                const keys = cache.getKeys();

                for (const key of keys) {

                    cache.remove(key);
                }
            }
        }

        acceptAsset(asset: any): boolean {

            return asset instanceof pack.core.SpineAssetPackItem;
        }

        async updateLoader(scene: BaseScene, asset: any) {

            const item = asset as pack.core.AssetPackItem;

            await item.preload();

            item.addToPhaserCache(scene.game, scene.getPackCache());
        }

        async updateLoaderWithObjData(scene: BaseScene, data: core.json.IObjectData): Promise<void> {
            // TODO
        }
    }
}