/// <reference path="./SpineObject.ts"/>

namespace phasereditor2d.scene.ui.sceneobjects {

    import code = core.code;

    export class SpineComponent extends Component<SpineObject> {

        static dataKey = SimpleProperty("dataKey", undefined, "Data Key", "The skeleton data key");
        static atlasKey = SimpleProperty("atlasKey", undefined, "Atlas Key", "The skeleton data key");

        static skin: IEnumProperty<SpineObject, string> = {
            name: "skinName",
            defValue: null,
            label: "Skin",
            tooltip: "Skeleton's current skin.",
            getEnumValues: obj => [null, ...obj.skeleton.data.skins.map(s => s.name)],
            getValueLabel: val => val ?? "<null>",
            getValue: (obj: SpineObject) => {

                return obj.skeleton.skin?.name || null;
            },
            setValue: function (obj: SpineObject, value: string): void {

                try {

                    if (value) {

                        obj.skeleton.setSkinByName(value);

                    } else {

                        obj.skeleton.setSkin(null);
                    }

                    obj.skeleton.setToSetupPose();
                    obj.updateBoundsProvider();

                } catch (e) {

                    obj.skeleton.setSkin(null);
                }
            },
        };

        static bpType: IEnumProperty<SpineObject, BoundsProviderType> = {
            name: "bpType",
            label: "BP",
            tooltip: "The type of the bounds provider.",
            defValue: BoundsProviderType.SETUP_TYPE,
            values: [BoundsProviderType.SETUP_TYPE, BoundsProviderType.SKINS_AND_ANIMATION_TYPE],
            getValue: obj => obj.bpType,
            setValue: (obj, val) => {

                obj.bpType = val;
                obj.updateBoundsProvider();
            },
            getValueLabel: val => val.toString()
        };

        static bpSkin: IEnumProperty<SpineObject, BoundsProviderSkin> = {
            name: "bpSkin",
            label: "BP Skin",
            tooltip: "The skins to use in the SkinsAndAnimationBoundsProvider.",
            defValue: BoundsProviderSkin.CURRENT_SKIN,
            values: [BoundsProviderSkin.CURRENT_SKIN, BoundsProviderSkin.ALL_SKINS],
            getValue: obj => obj.bpSkin,
            setValue: (obj, val) => {

                obj.bpSkin = val;
                obj.updateBoundsProvider();
            },
            getValueLabel: val => val.toString()
        };

        static bpAnimation: IEnumProperty<SpineObject, string> = {
            name: "bpAnimation",
            label: "BP Animation",
            tooltip: "The animation to use in the SkinsAndAnimationBoundsProvider.",
            defValue: null,
            getEnumValues: obj => [null, ...obj.skeleton.data.animations.map(a => a.name)],
            getValue: obj => obj.bpAnimation,
            setValue: (obj, val) => {

                obj.bpAnimation = val;
                obj.updateBoundsProvider();
            },
            getValueLabel: val => val ? val.toString() : "<null>"
        };

        static bpTimeStep = SimpleProperty(
            "bpTimeStep", SpineObject.DEFAULT_BP_TIME_STEP, "BP Time Step",
            "The timeStep of the SkinAndAnimationBoundsProvider.",
            false, (obj: SpineObject) => {

                obj.updateBoundsProvider();
            })


        constructor(obj: SpineObject) {
            super(obj, [
                SpineComponent.dataKey,
                SpineComponent.atlasKey,
                SpineComponent.skin,
                SpineComponent.bpType,
                SpineComponent.bpSkin,
                SpineComponent.bpAnimation,
                SpineComponent.bpTimeStep
            ]);
        }

        readJSON(ser: core.json.Serializer): void {

            super.readJSON(ser);
        }

        buildSetObjectPropertiesCodeDOM(args: ISetObjectPropertiesCodeDOMArgs): void {

            // skin

            this.buildSetObjectPropertyCodeDOM([SpineComponent.skin], args2 => {

                const dom = new code.MethodCallCodeDOM("skeleton.setSkinByName", args.objectVarName);

                dom.argLiteral(args2.value);

                args.statements.push(dom);
            });

            // bounds provider
            
            const objES = this.getEditorSupport();

            if (objES.isNestedPrefabInstance()) {

                if (objES.isUnlockedProperty(SpineComponent.bpType)) {

                    const newBoundsProviderExpr = SpineCodeDOMBuilder.generateNewBoundsProviderExpression(this.getObject(), args.unit);
                    
                    const propDom = new code.AssignPropertyCodeDOM("boundsProvider", args.objectVarName);

                    propDom.value(newBoundsProviderExpr);

                    const updateSizeDom = new code.MethodCallCodeDOM("updateSize", args.objectVarName);

                    args.statements.push(propDom, updateSizeDom);
                }
            }
        }
    }
}