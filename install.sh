sudo apt update && sudo apt upgrade -y
sudo apt install ffmpeg git curl -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
source ~/.bashrc
nvm install 20
nvm alias default 20
nvm use default
npm install -g pm2 yarn
yarn
pm2 start pm2.config.cjs && pm2 logs neoxr
