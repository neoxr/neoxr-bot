{ pkgs }: {
	deps = [
	pkgs.openssh_with_kerberos
    pkgs.nodejs
    pkgs.nodePackages.typescript
    pkgs.arcan.ffmpeg
    pkgs.libwebp
    pkgs.nodePackages.yarn
    pkgs.replitPackages.jest
	];
}