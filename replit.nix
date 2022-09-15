{ pkgs }: {
    deps = [
        pkgs.nodejs
        pkgs.openssh_with_kerberos
        pkgs.nodePackages.typescript
        pkgs.arcan.ffmpeg
        pkgs.libwebp
        pkgs.imagemagick
        pkgs.git
        pkgs.wget
        pkgs.yarn
        pkgs.libuuid
    ];
    env = {
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.libuuid
        ];
    };
}