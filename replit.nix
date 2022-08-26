{ pkgs }: {
	deps = [
		pkgs.nodejs-14_x
        pkgs.ffmpeg
        pkgs.nodePackages.typescript-language-server
        pkgs.yarn
        pkgs.replitPackages.jest
	];
}