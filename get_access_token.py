# -*- coding:utf-8 -*-

# https://qiita.com/wifecooky/items/d55aafb31e831f90edd8

import urllib
import oauth2 as oauth

request_token_url = 'https://twitter.com/oauth/request_token'
access_token_url = 'https://twitter.com/oauth/access_token'
authenticate_url = 'https://twitter.com/oauth/authorize'
callback_url = ""
consumer_key = ''  # ご自身のアプリケーションのconsumer_keyに変更してください。
consumer_secret = '' # ご自身のアプリケーションのconsumer_keyに変更してください。

def get_request_token():
	consumer = oauth.Consumer(key=consumer_key, secret=consumer_secret)
	client = oauth.Client(consumer)

	# reqest_token を取得
	#resp, content = client.request(request_token_url, 'GET')
	resp, content = client.request('%s?&oauth_callback=%s' % \
								   (request_token_url, callback_url))
	print(content)
	request_token = dict(parse_qsl(content))
	return request_token['oauth_token']


def parse_qsl(url):
	param = {}
	for i in url.split(b'&'):
		_p = i.split(b'=')
		param.update({_p[0]: _p[1]})
	return param


def get_access_token(oauth_token, oauth_verifier):
	consumer = oauth.Consumer(key=consumer_key, secret=consumer_secret)
	token = oauth.Token(oauth_token, oauth_verifier)

	client = oauth.Client(consumer, token)
	resp, content = client.request("https://api.twitter.com/oauth/access_token",
								   "POST", body="oauth_verifier={0}".format(oauth_verifier))
	return content


if __name__ == '__main__':
	sequence = 1

	# request tokenを取得
	if sequence == 1:
		request_token = get_request_token()

		print("request_token:", request_token)

	elif sequence == 2:
		# request_tokenを認証endpointにつけて認証urlを生成する。
		# 認証urlの例:https://twitter.com/oauth/authorize?oauth_token=u2jGxAAAAAAAzgSuAAABX7Qdr6A
		request_token = ""
		authorize_url = '%s?oauth_token=%s' % (authenticate_url, request_token)

		print(authorize_url)

		# authorize_urlをクリックすると、Twitterの認証画面に遷移する。
		# 「連携アプリを認証」ボタンを押すと、事前に設定された callback_urlに飛ばされる。

	elif sequence == 3:

		# callback_urlについている oauth_tokenとoauth_verifierでaccess tokenを取得
		# callback_url例：https://aifan.jp/?aaa=111,bbb=222,ccc=333333333333333/&oauth_token=kN1vfgAAAAAAzgSuAAABX7QOadg&oauth_verifier=oncUYcnbgt6SKSBGeVTrdhzmi7pU1xli
		oauth_token = ""
		oauth_verifier = ""
		response = get_access_token(oauth_token, oauth_verifier)
		print(response)
		# response例：oauth_token=838678918160797696-wtAa3QTxDY3QrWCxSyvhARRK1H69MlK&oauth_token_secret=whtosInzvfGTYj4uDKJ3Q5BLWSjgROSvBmRI0eFLvPXTC&user_id=838678918160797696&screen_name=wen_htl&x_auth_expires=0
		# responseにあるoauth_tokenとoauth_token_secretがAPIをコールするときに必要なaccesss token とaccess secretです。