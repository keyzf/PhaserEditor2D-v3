namespace phasereditor2d.ide.ui.dialogs {

    import controls = colibri.ui.controls;

    export class UnlockDialog extends controls.dialogs.InputDialog {

        create() {

            super.create();

            this.setTitle("Unlock Phaser Editor 2D");
            this.setMessage("Enter the License Key");
            // https://gum.co/axjH
            const btn = this.addButton("Get License Key", () => {
                // TODO
            });
            btn.style.float = "left";

            this.getAcceptButton().innerText = "Unlock";

            this.setInputValidator(text => text.trim().length > 0);

            this.validate();

            this.setResultCallback(async (value) => {

                const data = await colibri.core.io.apiRequest("UnlockEditor", {
                    lickey: value
                });

                if (!data.error) {

                    alert(data.message);

                    setTimeout(() => {
                        if (confirm("A page refresh is required. Do you want to refresh it now?")) {

                            window.location.reload();
                        }
                    }, 3000);
                }
            });
        }
    }
}