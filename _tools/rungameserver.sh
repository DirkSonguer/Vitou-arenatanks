find . ! -name rungameserver.sh ! -name rungameclient.sh -delete
{
	cp -R ../Vitou/* ./
	cp -R ../Vitou-examplegame/* ./
} &> /dev/null
echo
node ./vitou.js
echo "Done."
