{ pkgs }: {
    deps = [
        pkgs.nodejs-16_x
        pkgs.openssh_with_kerberos
        pkgs.nodePackages.typescript
        pkhs.nodePackages.forever
        pkgs.arcan.ffmpeg
        pkgs.libwebp
        pkgs.imagemagick
        pkgs.git
        pkgs.wget
        pkgs.libuuid
    ];
    env = {
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.libuuid
        ];
    };
}