#include <bits/stdc++.h>

#include "util.h"
#define MAX_TIMES 1
#define N 2
#define TX -40

using namespace std;

typedef pair<int, int> pii;

struct plug_info{
    int time, rssi[12], power;

    plug_info(int p_time, int p_rssi[12], int p_power){
        time = p_time;
        for(int i = 0 ; i < 12 ; ++i)
            rssi[i] = p_rssi[i];
        power = p_power;
    }

    int getTime(){
        return time;
    }

    int getRssi(int index){
        return rssi[index];
    }

    int* getAllRssi(){
        return rssi;
    }

    int getPower(){
        return power;
    }
};

// void setCurrentValue(vector<int>& hCurrent, int rotate_src, int rotate_dest){
//     int start = rotate_src*55*2 + (rotate_src/2)*50;
//     int end = rotate_dest*55*2 + (rotate_dest/2)*50;
//     for(int i = 0; i < start ; ++i)
//         hCurrent.push_back(0);
//     for(int i = start ; i < end ; ++i)
//         hCurrent.push_back(1);
//     for(int i = end ; i < 19440 ; ++i)
//         hCurrent.push_back(0);
// }

void setCurrentValue(vector<int>& hCurrent, int rotate_src, int rotate_dest){
    int start = rotate_src;
    int end   = rotate_dest;

    for(int i = 0; i < start ; ++i)
        hCurrent.push_back(0);
    for(int i = start ; i < end ; ++i)
        hCurrent.push_back(1);
    for(int i = end ; i < 800 ; ++i)
        hCurrent.push_back(0);
}

void setCurrent(vector<int>* current){
    for(int times = 0 ; times < MAX_TIMES ; ++times){
        setCurrentValue(current[3], 280,680);

        setCurrentValue(current[0], 0,0);
        setCurrentValue(current[1], 0,0);
        setCurrentValue(current[2], 0,0);
        setCurrentValue(current[4], 0,0);
        setCurrentValue(current[5], 0,0);
        setCurrentValue(current[6], 0,0);
        setCurrentValue(current[7], 0,0);
        setCurrentValue(current[8], 0,0);
        setCurrentValue(current[9], 0,0);
        setCurrentValue(current[10], 0,0);
        setCurrentValue(current[11], 0,0);
    }
}
// void setCurrent(vector<int>* current){
//     for(int times = 0 ; times < MAX_TIMES ; ++times){
//         setCurrentValue(current[0], 4,8);
//         setCurrentValue(current[3], 1,33);
//         setCurrentValue(current[6], 2,18);
//         setCurrentValue(current[9], 3,14);


//         setCurrentValue(current[1], 0,0);
//         setCurrentValue(current[2], 0,0);
//         setCurrentValue(current[4], 0,0);
//         setCurrentValue(current[5], 0,0);
//         setCurrentValue(current[7], 0,0);
//         setCurrentValue(current[8], 0,0);
//         setCurrentValue(current[10], 0,0);
//         setCurrentValue(current[11], 0,0);
//     }
// }

void setBeacon(vector<pii>& beacon){
    //set Beacon coordination
    beacon.emplace_back(0,20);
    beacon.emplace_back(0,80);
    beacon.emplace_back(20,0);
    beacon.emplace_back(20,100);
    beacon.emplace_back(20,40);
    beacon.emplace_back(10,60);
    beacon.emplace_back(60,80);
    beacon.emplace_back(60,10);
    beacon.emplace_back(80,100);
    beacon.emplace_back(80,0);
    beacon.emplace_back(90,60);
    beacon.emplace_back(100,35);
}


void setPoint(vector<pii>& point){
    // for(int step = 0; step < MAX_TIMES*36 ; ++step){
    //     set1RoomOut(point); 
    //     set2RoomIn(point); 
    //     set2RoomOut(point);
    //     setAisleDown(point);
    //     set4RoomIn(point);
    //     set4RoomOut(point);
    //     set3RoomIn(point);
    //     set3RoomOut(point);
    //     setAisleUp(point); 
    //     set1RoomIn(point);
    // }
    setSimpleRoom(point);
    setSimpleRoom(point);
}

void setSimpleRoom(vector<pii>& point){
    for(int i = 1 ; i <= 100 ; ++i)
        point.emplace_back(i,0);
    for(int i = 1 ; i <= 100 ; ++i)
        point.emplace_back(100,i);
    for(int i = 1 ; i <= 100 ; ++i)
        point.emplace_back(100-i, 100);
    for(int i = 1 ; i <= 100 ; ++i)
        point.emplace_back(0,100-i);
}


// current fucntion
// room 1 : 0 1  2
// room 2 : 3 4  5 
// room 3 : 6 7  8
// room 4 : 9 10 11
void set1RoomOut(vector<pii>& point){
    for(int j = 1 ; j <= 25 ; ++j){
        point.emplace_back(20, 100-j);
    }

    for(int i = 1 ; i <= 30 ; ++i){
        point.emplace_back(20+i, 75);
    }
}

void set1RoomIn(vector<pii>& point){
    for(int i = 1 ; i <= 30 ; ++i){
        point.emplace_back(50-i, 75);
    }

    for(int j = 1 ; j <= 25 ; ++j){
        point.emplace_back(20, 75+j);
    }
}

void set2RoomOut(vector<pii>& point){
    for(int j = 1 ; j <= 25 ; ++j){
        point.emplace_back(80, 100-j);
    }

    for(int i = 1 ; i <= 30 ; ++i){
        point.emplace_back(80-i, 75);
    }
}

void set2RoomIn(vector<pii>& point){
    for(int i = 1 ; i <= 30 ; ++i){
        point.emplace_back(50+i, 75);
    }

    for(int j = 1 ; j <= 25 ; ++j){
        point.emplace_back(80, 75+j);
    }
}

void set3RoomOut(vector<pii>& point){
    for(int j = 1 ; j <= 25 ; ++j){
        point.emplace_back(20, j);
    }

    for(int i = 1 ; i <= 30 ; ++i){
        point.emplace_back(20+i, 25);
    }
}

void set3RoomIn(vector<pii>& point){
    for(int i = 1 ; i <= 30 ; ++i){
        point.emplace_back(50-i, 25);
    }

    for(int j = 1 ; j <= 25 ; ++j){
        point.emplace_back(20, 25-j);
    }
}

void set4RoomOut(vector<pii>& point){
    for(int j = 1 ; j <= 25 ; ++j){
        point.emplace_back(80, j);
    }

    for(int i = 1 ; i <= 30 ; ++i){
        point.emplace_back(80-i, 25);
    }
}

void set4RoomIn(vector<pii>& point){
    for(int i = 1 ; i <= 30 ; ++i){
        point.emplace_back(50+i, 25);
    }

    for(int j = 1 ; j <= 25 ; ++j){
        point.emplace_back(80, 25-j);
    }
}

void setAisleUp(vector<pii>& point){
    for(int j = 1 ; j <= 50 ; ++j){
        point.emplace_back(50, 25+j);
    }
}

void setAisleDown(vector<pii>& point){
    for(int j = 1 ; j <= 50 ; ++j){
        point.emplace_back(50, 75-j);
    }
}

double setDist(pii lhs, pii rhs){
    return sqrt(pow(lhs.first-rhs.first,2)+pow(lhs.second-rhs.second,2));
}

//rssi = tx - (10*N) * log(Distance) 
double setRssi(double Dist){
    if(!Dist) return TX;
    int rssi = TX - 10*N*log10(Dist);
    return rssi;
}


void setDummyData(vector<int>* rssi, vector<int>* current){
    fstream out_dummy("/Users/gyeongmin/Final_project/DeepLearning/Data/rssiDummy.csv", ios::out);
    int index = 1;

    out_dummy << "time,";
    for(int i = 0; i < 12 ; ++i)
        out_dummy << "rssi" << i << ",";
    for(int i = 0; i < 12 ; ++i)
        out_dummy << "current" << i << (i == 11 ? "" : ",");
    out_dummy << "\n";

    for(int j = 0 ; j < rssi[0].size() ; ++j){
        out_dummy << index++ << ",";
        for(int i = 0; i < 12 ; ++i)
            out_dummy << rssi[i][j] << ",";
        for(int i = 0; i < 12 ; ++i)
            out_dummy << current[i][j] << (i == 11 ? "" : ",");
        out_dummy << "\n";
    }
    // out_dummy.close();
}

time_t getCurrentTime(){
    time_t result = time(nullptr);
    // cout << " asctime : " << asctime(localtime(&result)) << endl;
    // cout << "result : " << result << endl;
    cout << asctime(localtime(&result)) << result << " seconds since the Epoch\n";

    return result;
}