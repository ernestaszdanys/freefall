function easeOutPower3(vS, vE, tS, tE, t) {
    var dT = tE - tS,
        dV = vE - vS,
        normalizedDt = (t - tS) / dT;
    
    if (normalizedDt > 1) {
        normalizedDt = 1;    
    } else if (normalizedDt < 0) {
        normalizedDt = 0;   
    }

    /*ease-in : time = time^2
    ease-out : time = 1-(1-time)^2*/
    
    normalizedDt = 1 - normalizedDt;
    normalizedDt = normalizedDt * normalizedDt * normalizedDt;
    normalizedDt = 1 - normalizedDt;
    
    return normalizedDt * dV + vS;
    
    
}