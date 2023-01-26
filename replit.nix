{ pkgs }: {
    deps = [
        pkgs.nodejs-14_x
        pkgs.openssh_with_kerberos
        pkgs.nodePackages.typescript
        pkgs.arcan.ffmpeg
        pkgs.libwebp
        pkgs.imagemagick
        pkgs.libuuid
        pkgs.tree
        pkgs.python
        pkgs.nodePackages.pm2
    ];
    env = {
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.libuuid
        ];
    };
}