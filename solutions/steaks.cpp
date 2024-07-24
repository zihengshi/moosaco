#include <iostream>
#include <string>
using namespace std;

int main(void) {
    string steaks[7] = {"Bessie", "Elsie", "Daisy", "Gertie", "Annabelle", "Maggie", "Henrietta"};
    int maximum = 0, secondmax = 0;
    for (int i = 0; i < 7; i++) {
        int price;
        cin >> price;
        maximum = max(price, maximum);
        if (price < max) {
            secondmax = max(price, secondmax);
        }
    }
    cout << steaks[max] << " " << steaks[secondmax] << endl;
}