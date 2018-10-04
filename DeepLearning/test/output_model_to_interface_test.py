import json
import requests
import time

def res_to_webserver() :
    WEBSERVER_IP = '127.0.0.1'
    WEBSERVER_PORT = '3000'
    WEBSERVER_POST = '/~'

    WEBSERVER_ADDR = 'http://' + WEBSERVER_IP + ':' + WEBSERVER_PORT + WEBSERVER_POST 

    """
    FIX : header, params => webserver post
    "  header = {
    "      'Accept':'application/json',
    "      'X-M2M-RI':'12345',
    "      'X-M2M-Origin':'SOrigin'
    "  }
    "  headers = {'content-type': 'application/json'}
    "  params = {'sessionKey': '9ebbd0b25760557393a43064a92bae539d962103', 'format': 'xml', 'platformId': 1}
    """

    for i in range(10) :
        res = res_json(1, i%2, i*10)
        # requests.post(WEBSERVER_ADDR, params=params, data=json.dump(res), headers=headers)
        print("res : {}".format(res))
        time.sleep(0.5)

def res_json(plug_index, current_state, aftertime) :
    """
    { plug: mac | plug name, predicted: false, after: 100}
    """
    res = ('{' +
            'plug: ' + '00:0b:57:27:c0:93' + ', ' +
            'predicted: ' + ('true' if current_state else 'false') + ', ' +
            'after: ' + str(aftertime) + 
            '}')
    return res

def main() :
    res_to_webserver()

if __name__ == '__main__' :
    main()