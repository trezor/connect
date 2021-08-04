.PHONY: clean submodules eth-tokens

clean:
	rm -rf build/

# manually: goto ./submodules/trezor-common; git checkout master; git pull
submodules:
	cd ./submodules/trezor-common; git checkout master; git pull; git submodule update --recursive

# Sync build
sync-%:
	# Before first use: Install awscli (pip install awscli)
	# Configure access credentials (aws configure), region is "eu-central-1"
	aws s3 sync --delete --cache-control 'public, max-age=3600' build/ s3://connect.trezor.io/$*/
	aws cloudfront create-invalidation --distribution-id E3LVNAOGT94E37 --paths '/*'

eth-tokens:
	./submodules/trezor-common/tools/cointool.py dump -p -I erc20 -f chain=eth -e chain -e chain_id -e ens_address -e key -e logo -e social -e support -e type -e website -e shortcut -o ./src/data/ethereumTokens.json

.DEFAULT_GOAL:= default
default:
	@echo "Sync:"
	@echo "s3 sync version build to server (connect.trezor.io)"
	@echo "    make sync-[X]"
