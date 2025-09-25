// ODE factory and utilities
(function(global){
    function sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    function getOdeFunction(model, params) {
        switch (model.ode_type) {
            case 'wilson_cowan':
                return function(t, y) {
                    const E = y[0];
                    const I = y[1];

                    const dE_dt = (-E + (1 - E) * sigmoid(params.w_ee * E - params.w_ei * I - params.theta_e + params.P)) / params.tau_e;
                    const dI_dt = (-I + (1 - I) * sigmoid(params.w_ie * E - params.w_ii * I - params.theta_i + params.Q)) / params.tau_i;

                    return [dE_dt, dI_dt];
                };
            case 'damped_harmonic':
                return function(t, y) {
                    const x = y[0];
                    const v = y[1];
                    
                    const dx_dt = v;
                    const dv_dt = -params.omega * params.omega * x - 2 * params.gamma * v + params.A * Math.cos(params.omega_f * t);
                    
                    return [dx_dt, dv_dt];
                };
            case 'coupled_wilson_cowan':
                return function(t, y) {
                    const E1 = y[0];
                    const I1 = y[1];
                    const E2 = y[2];
                    const I2 = y[3];

                    const dE1_dt = (-E1 + (1 - E1) * sigmoid(params.w_ee1 * E1 - params.w_ei1 * I1 + params.w_c21 * E2 - params.theta_e1 + params.P1)) / params.tau_e1;
                    const dI1_dt = (-I1 + (1 - I1) * sigmoid(params.w_ie1 * E1 - params.w_ii1 * I1 - params.theta_i1 + params.Q1)) / params.tau_i1;
                    
                    const dE2_dt = (-E2 + (1 - E2) * sigmoid(params.w_ee2 * E2 - params.w_ei2 * I2 + params.w_c12 * E1 - params.theta_e2 + params.P2)) / params.tau_e2;
                    const dI2_dt = (-I2 + (1 - I2) * sigmoid(params.w_ie2 * E2 - params.w_ii2 * I2 - params.theta_i2 + params.Q2)) / params.tau_i2;

                    return [dE1_dt, dI1_dt, dE2_dt, dI2_dt];
                };
            default:
                throw new Error(`Unknown ODE type: ${model.ode_type}`);
        }
    }

    global.getOdeFunction = getOdeFunction;
})(window);
