

#  ssh into server instance

cd merchant_boarding_integration

git pull origin main 

npm i 

pm2 restart merchant_boarding_integration

pm2 save 

sudo nginx -t

sudo systemctl reload nginx

exit 

