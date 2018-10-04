import paho.mqtt.client as mqtt
import paho.mqtt.subscribe as subscribe
import json

# from mongo import mongoDB

MOBIUS_IP = '52.78.33.177'
MOBIUS_PORT = 7579
rssi_HashMap = dict()
# client.subscribe("/oneM2M/req/Mobius/Ssmart-home/json")
# The callback for when the client receives a CONNACK response from the server.

def on_connect(client, userdata, flags, rc) :
    print("Connected with result code "+str(rc))

    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    client.subscribe("/oneM2M/req/Mobius/Ssmart-home/rssi/json")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg) :
    print(msg.topic+" "+str(msg.payloadj))
    client.publish("/oneM2m/res/Mobius/Ssmart-home/rssi/json","reply")
    print("reply~!!!!!!!!!!!!!!!!")


# b'{
# "op":5,
# "rqi":"SyB1ZiUJcQ",
# "to":"mqtt://52.78.33.177/Ssmart-home/rssi?ct=json",
# "fr":"/Mobius",
# "pc":
#   {"m2m:sgn":
#       {"sur":"Mobius/smart-home/rssi/sub",
#        "nev":
#           {"net":3,
#            "rep":
#               {"m2m:cin":
#                   {"rn":"4-20181001082942807p3wT",
#                   "ty":4,
#                   "pi":"SymdzBsjd7",
#                   "ri":"SkQ1bjLycm",
#                   "ct":"20181001T082942",
#                   "et":"20211001T082942",
#                   "lt":"20181001T082942",
#                   "st":25355,
#                   "cs":2,
#                   "con":
#                       {},

#pc ->m2m:sgn -> nev -> rep -> m2m:cin -> con
def on_message_print(client, userdata, message):
    print("%s \n%s" % (message.topic, message.payload))
    # json_str = str(message.payload)
    json_str = json.dumps(message.payload)
    json_str = json.loads(json_str)
    print("on_message :: json_str\n{}".format(json_str))
    rssi_data = json_str['pc']['m2m:sgn']['nev']['rep']['m2m:cin']['con']
    print("on_message :: rssi_data\n{}".format(rssi_data))
    for plug in rssi_data :
        if BEACON_MAC_ADDR in rssi_data[plug] :
            rssi = rssi_data[plug][BEACON_MAC_ADDR]
            rssi_HashMap[plug] = rssi
    rssi_HashMap['timestep'] = str(datetime.utcnow())
    print("on_message :: rssi_hashMap result \n{}".format(rssi_HashMap))

    # mongodb.putData(data = rssi_HashMap, tablename = 'rssi_real')
    client.publish("/prediction","reply")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MOBIUS_IP, MOBIUS_PORT, 60)

subscribe.callback(on_message_print, "/oneM2M/req/Mobius/Ssmart-home/rssi/json", hostname= MOBIUS_IP)

client.loop_forever()


