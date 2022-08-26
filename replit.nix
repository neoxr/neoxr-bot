{ pkgs }: {
	deps = [
		pkgs.nodejs-14_x
        pkgs.ffmpeg
        pkgs.libwebp
        pkgs.imagemagick
        pkgs.nodePackages.typescript-language-server
        pkgs.yarn
        pkgs.replitPackages.jest
        pkgs.libuuid
	];
	env = {
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.libuuid
        ];
    };
}