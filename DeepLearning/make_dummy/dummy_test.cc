#include <bits/stdc++.h>
#include "util.h"
using namespace std;
typedef pair<int, int> pii;

int main(){
    // fstream out_current("/Users/gyeongmin/Final_project/BeaconData/Data/currentOut.txt", ios::out);
    vector<pii> beacon, point;
    vector<int> current[12], rssi[12];
    vector<int> temp;

    getCurrentTime();
    setBeacon(beacon);
    setCurrent(current);
    setPoint(point);

    //route 1->2->aisle->4->3->aisle->1 * 100 times
    for(auto&& it : point){
        for(int i = 0 ; i < 12 ; ++i){
            rssi[i].push_back(setRssi(setDist(it, beacon[i])));
        }
    }
    setDummyData(rssi, current);

    return 0;
}
    