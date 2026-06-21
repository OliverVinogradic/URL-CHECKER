#include <iostream>
#include <string>
#include <curl/curl.h>

// Callback to handle data received from the Google API response
size_t writeCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

// Structural input validation before performing API requests
bool isValidUrl(const std::string& url) {
    if (url.length() < 12) return false;

    if (url.rfind("http://", 0) != 0 && url.rfind("https://", 0) != 0) {
        return false;
    }

    if (url.find('.') == std::string::npos) {
        return false;
    }

    return true;
}

void checkDangerousUrl(const std::string& target_url) {
    if (!isValidUrl(target_url)) {
        std::cout << "[UNGÜLTIG] Please enter a valid URL (e.g., https://example.com)." << std::endl;
        return;
    }

    CURL* curl = curl_easy_init();
    if (!curl) return;

    // Replace with your restricted Google Safe Browsing API key
    std::string api_key = "YOUR_API_KEY_HERE"; 
    std::string api_url = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + api_key;

    std::string readBuffer;

    // Constructing the JSON payload required by the Safe Browsing v4 API
    std::string json_payload = "{"
        "\"client\": {\"clientId\": \"my_url_checker\", \"clientVersion\": \"1.0.0\"},"
        "\"threatInfo\": {"
            "\"threatTypes\": [\"MALWARE\", \"SOCIAL_ENGINEERING\", \"UNWANTED_SOFTWARE\"],"
            "\"platformTypes\": [\"ANY_PLATFORM\"],"
            "\"threatEntryTypes\": [\"URL\"],"
            "\"threatEntries\": [{\"url\": \"" + target_url + "\"}]"
        "}"
    "}";

    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");

    curl_easy_setopt(curl, CURLOPT_URL, api_url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POST, 1L);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_payload.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);

    CURLcode res = curl_easy_perform(curl);

    if (res == CURLE_OK) {
        // If the response contains "matches", the URL is classified as malicious
        if (readBuffer.find("matches") != std::string::npos) {
            std::cout << "[WARNUNG] " << target_url << " IS DANGEROUS!" << std::endl;
        } else {
            std::cout << "[SAUBER] " << target_url << " is safe." << std::endl;
        }
    } else {
        std::cerr << "API Request failed: " << curl_easy_strerror(res) << std::endl;
    }

    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cout << "Usage: ./urlchecker <URL>" << std::endl;
        return 1;
    }
    
    curl_global_init(CURL_GLOBAL_ALL);
    std::string url_to_check = argv[1];
    checkDangerousUrl(url_to_check);
    curl_global_cleanup();
    return 0;
}
