import threading
lock = threading.Lock()

shared_dict = {}

def do_thing(user, value):
    lock.acquire()
    try:
        shared_dict[user] = value
    finally:
        # Always called, even if exception is raised in try block
        lock.release()