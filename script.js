document.addEventListener('DOMContentLoaded', function() {
    const modelSelect = document.getElementById('model-select');
    const slidersContainer = document.getElementById('sliders');
    const plotDiv = document.getElementById('plot');
    const plotDiv2 = document.getElementById('plot2');
    const formulaContainer = document.getElementById('formula-container');
    const tmaxSlider = document.getElementById('tmax-slider');
    const tmax_value = document.getElementById('tmax-value');
    const solverSelect = document.getElementById('solver-select');
    const xlimValue = document.getElementById('xlim-value');
    const ylimValue = document.getElementById('ylim-value');
    const clearTrajectoriesBtn = document.getElementById('clear-trajectories');
    
    // Axis range control elements
    const xlimMinInput = document.getElementById('xlim-min-input');
    const xlimMaxInput = document.getElementById('xlim-max-input');
    const xlimMinDecrease = document.getElementById('xlim-min-decrease');
    const xlimMinIncrease = document.getElementById('xlim-min-increase');
    const xlimMaxDecrease = document.getElementById('xlim-max-decrease');
    const xlimMaxIncrease = document.getElementById('xlim-max-increase');
    
    const ylimMinInput = document.getElementById('ylim-min-input');
    const ylimMaxInput = document.getElementById('ylim-max-input');
    const ylimMinDecrease = document.getElementById('ylim-min-decrease');
    const ylimMinIncrease = document.getElementById('ylim-min-increase');
    const ylimMaxDecrease = document.getElementById('ylim-max-decrease');
    const ylimMaxIncrease = document.getElementById('ylim-max-increase');
    // Plot 2 Axis range control elements
    const plot2Controls = document.getElementById('plot2-controls');
    const xlim2Value = document.getElementById('xlim2-value');
    const ylim2Value = document.getElementById('ylim2-value');
    const xlim2MinInput = document.getElementById('xlim2-min-input');
    const xlim2MaxInput = document.getElementById('xlim2-max-input');
    const xlim2MinDecrease = document.getElementById('xlim2-min-decrease');
    const xlim2MinIncrease = document.getElementById('xlim2-min-increase');
    const xlim2MaxDecrease = document.getElementById('xlim2-max-decrease');
    const xlim2MaxIncrease = document.getElementById('xlim2-max-increase');
    const ylim2MinInput = document.getElementById('ylim2-min-input');
    const ylim2MaxInput = document.getElementById('ylim2-max-input');
    const ylim2MinDecrease = document.getElementById('ylim2-min-decrease');
    const ylim2MinIncrease = document.getElementById('ylim2-min-increase');
    const ylim2MaxDecrease = document.getElementById('ylim2-max-decrease');
    const ylim2MaxIncrease = document.getElementById('ylim2-max-increase');
    
    // Continuous simulation elements
    const startSimBtn = document.getElementById('start-simulation');
    const stopSimBtn = document.getElementById('stop-simulation');
    const resetSimBtn = document.getElementById('reset-simulation');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const timeWindowSlider = document.getElementById('time-window-slider');
    const timeWindowValue = document.getElementById('time-window-value');
    const timePlotDiv = document.getElementById('time-plot');
    const timePlotDiv2 = document.getElementById('time-plot2');

    let trajectories = []; // Store clicked trajectories
    let clickTimeout = null; // Debounce clicks
    
    // Continuous simulation state
    let isSimulating = false;
    let simulationInterval = null;
    let currentTime = 0;
    let timeData = [];
    let currentState = [0.1, 0.1]; // Default initial state

    let models = {}; // Will be loaded from JSON
    let currentParams = {};

    // Load models from JSON file
    async function loadModels() {
        try {
            const response = await fetch('models.json');
            const modelsData = await response.json();
            models = modelsData;
            console.log('Models loaded:', models);
            
            // Initialize after models are loaded
            initializeApp();
        } catch (error) {
            console.error('Error loading models:', error);
            // Fallback to hardcoded models if JSON fails
            loadFallbackModels();
            initializeApp();
        }
    }

    function loadFallbackModels() {
        models = {
            'wilson-cowan': {
                name: 'Wilson-Cowan',
                params: {
                    w_ee: { min: 0, max: 20, value: 10, step: 0.1, latex: 'w_{ee}' },
                    w_ei: { min: 0, max: 20, value: 10, step: 0.1, latex: 'w_{ei}' },
                    w_ie: { min: 0, max: 20, value: 10, step: 0.1, latex: 'w_{ie}' },
                    w_ii: { min: 0, max: 20, value: 10, step: 0.1, latex: 'w_{ii}' },
                    theta_e: { min: 0, max: 10, value: 4, step: 0.1, latex: '\\theta_e' },
                    theta_i: { min: 0, max: 10, value: 3.7, step: 0.1, latex: '\\theta_i' },
                    P: { min: 0, max: 5, value: 1.25, step: 0.05, latex: 'P' },
                    Q: { min: 0, max: 5, value: 0, step: 0.05, latex: 'Q' },
                    tau_e: { min: 0.1, max: 20, value: 8, step: 0.1, latex: '\\tau_e' },
                    tau_i: { min: 0.1, max: 20, value: 8, step: 0.1, latex: '\\tau_i' }
                },
                initial_conditions: [0.1, 0.1],
                plot_axes: ['E', 'I'],
                formula: `\\begin{align*} \\tau_e \\frac{dE}{dt} &= -E + (1 - E) S(w_{ee}E - w_{ei}I - \\theta_e + P) \\\\ \\tau_i \\frac{dI}{dt} &= -I + (1 - I) S(w_{ie}E - w_{ii}I - \\theta_i + Q) \\end{align*}`,
                ode_type: 'wilson_cowan'
            }
        };
    }

    // Initialize axis ranges from model configuration (first plot)
    function initializeAxisRanges(model) {
        const firstPlot = model.plots && model.plots[0];
        if (firstPlot && firstPlot.axis_ranges) {
            const xRange = firstPlot.axis_ranges.x;
            const yRange = firstPlot.axis_ranges.y;
            
            xlimMinInput.value = xRange.min;
            xlimMaxInput.value = xRange.max;
            xlimValue.textContent = `[${xRange.min}, ${xRange.max}]`;
            
            ylimMinInput.value = yRange.min;
            ylimMaxInput.value = yRange.max;
            ylimValue.textContent = `[${yRange.min}, ${yRange.max}]`;
        } else {
            // Fallback to default ranges
            xlimMinInput.value = 0;
            xlimMaxInput.value = 1;
            xlimValue.textContent = `[0, 1]`;
            
            ylimMinInput.value = 0;
            ylimMaxInput.value = 1;
            ylimValue.textContent = `[0, 1]`;
        }
        // Initialize second plot ranges (if available)
        const secondPlot = model.plots && model.plots[1];
        if (secondPlot && secondPlot.axis_ranges) {
            const x2 = secondPlot.axis_ranges.x;
            const y2 = secondPlot.axis_ranges.y;
            xlim2MinInput.value = x2.min;
            xlim2MaxInput.value = x2.max;
            xlim2Value.textContent = `[${x2.min}, ${x2.max}]`;
            ylim2MinInput.value = y2.min;
            ylim2MaxInput.value = y2.max;
            ylim2Value.textContent = `[${y2.min}, ${y2.max}]`;
            if (plot2Controls) plot2Controls.style.display = '';
        } else {
            if (plot2Controls) plot2Controls.style.display = 'none';
        }
    }

    // Initialize the app after models are loaded
    function initializeApp() {
        // Populate model select
        modelSelect.innerHTML = '';
        for (const modelKey in models) {
            const option = document.createElement('option');
            option.value = modelKey;
            option.textContent = models[modelKey].name;
            modelSelect.appendChild(option);
        }
        
        // Initialize with first model
        const firstModelKey = Object.keys(models)[0];
        modelSelect.value = firstModelKey;
        const initialModel = models[firstModelKey];
        
        // Set initial state from model
        currentState = [...initialModel.initial_conditions];
        
        // Create sliders and update display
        createSliders(initialModel);
        initializeAxisRanges(initialModel);
        updateFormula(initialModel);
        updatePlot();
        
        // Initialize time plot
        updateTimePlot();
        
        // Initialize button states
        stopSimBtn.disabled = true;
        resetSimBtn.disabled = true;
        
        // Add resize functionality
        setupPlotResizers();
        
        // Handle formula display when MathJax is ready
        setTimeout(() => updateFormula(initialModel), 1000);
        window.addEventListener('load', () => updateFormula(initialModel));
    }

    // Add resize functionality
    function setupPlotResizers() {
        const phaseContainer = document.getElementById('phase-plot-container');
        const phaseContainer2 = document.getElementById('phase-plot2-container');
        const timeContainer = document.getElementById('time-plot-container');
        const timeContainer2 = document.getElementById('time-plot2-container');
        
        // Add resize observers to detect when containers are resized
        if (window.ResizeObserver) {
            const phaseResizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    // Debounce the resize to avoid too many updates
                    clearTimeout(window.phaseResizeTimeout);
                    window.phaseResizeTimeout = setTimeout(() => {
                        Plotly.Plots.resize(plotDiv);
                    }, 100);
                }
            });
            const phase2ResizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    clearTimeout(window.phase2ResizeTimeout);
                    window.phase2ResizeTimeout = setTimeout(() => {
                        if (phaseContainer2 && phaseContainer2.style.display !== 'none') {
                            Plotly.Plots.resize(plotDiv2);
                        }
                    }, 100);
                }
            });
            
            const timeResizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    clearTimeout(window.timeResizeTimeout);
                    window.timeResizeTimeout = setTimeout(() => {
                        Plotly.Plots.resize(timePlotDiv);
                    }, 100);
                }
            });
            const time2ResizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    clearTimeout(window.time2ResizeTimeout);
                    window.time2ResizeTimeout = setTimeout(() => {
                        if (timeContainer2 && timeContainer2.style.display !== 'none') {
                            Plotly.Plots.resize(timePlotDiv2);
                        }
                    }, 100);
                }
            });
            
            phaseResizeObserver.observe(phaseContainer);
            if (phaseContainer2) phase2ResizeObserver.observe(phaseContainer2);
            timeResizeObserver.observe(timeContainer);
            if (timeContainer2) time2ResizeObserver.observe(timeContainer2);
        }
        
        // Add manual resize handles functionality
        const resizers = document.querySelectorAll('.plot-resizer');
        resizers.forEach(resizer => {
            let isResizing = false;
            let startY = 0;
            let startHeight = 0;
            let container = null;
            
            resizer.addEventListener('mousedown', (e) => {
                isResizing = true;
                container = resizer.parentElement;
                startY = e.clientY;
                startHeight = parseInt(window.getComputedStyle(container).height, 10);
                
                document.addEventListener('mousemove', handleResize);
                document.addEventListener('mouseup', stopResize);
                e.preventDefault();
            });
            
            function handleResize(e) {
                if (!isResizing) return;
                
                const deltaY = e.clientY - startY;
                const newHeight = Math.max(200, startHeight + deltaY);
                container.style.height = newHeight + 'px';
                container.style.flex = 'none';

                // Live resize the corresponding plot while dragging
                if (container.id === 'phase-plot-container') {
                    Plotly.Plots.resize(plotDiv);
                } else if (container.id === 'phase-plot2-container') {
                    Plotly.Plots.resize(plotDiv2);
                } else if (container.id === 'time-plot-container') {
                    Plotly.Plots.resize(timePlotDiv);
                } else if (container.id === 'time-plot2-container') {
                    Plotly.Plots.resize(timePlotDiv2);
                }
            }
            
            function stopResize() {
                if (!isResizing) return;
                isResizing = false;
                
                document.removeEventListener('mousemove', handleResize);
                document.removeEventListener('mouseup', stopResize);
                
                // Resize the plots after manual resize
                setTimeout(() => {
                    if (container.id === 'phase-plot-container') {
                        Plotly.Plots.resize(plotDiv);
                    } else if (container.id === 'phase-plot2-container') {
                        Plotly.Plots.resize(plotDiv2);
                    } else if (container.id === 'time-plot-container') {
                        Plotly.Plots.resize(timePlotDiv);
                    } else if (container.id === 'time-plot2-container') {
                        Plotly.Plots.resize(timePlotDiv2);
                    }
                }, 100);
            }
        });

        // Also handle window resize to keep plots responsive
        window.addEventListener('resize', () => {
            Plotly.Plots.resize(plotDiv);
            if (plotDiv2 && document.getElementById('phase-plot2-container').style.display !== 'none') {
                Plotly.Plots.resize(plotDiv2);
            }
            Plotly.Plots.resize(timePlotDiv);
            const time2Container = document.getElementById('time-plot2-container');
            if (timePlotDiv2 && time2Container && time2Container.style.display !== 'none') {
                Plotly.Plots.resize(timePlotDiv2);
            }
        });
    }

    // getOdeFunction is provided by odeFactory.js (global)

    function updateFormula(model) {
        formulaContainer.innerHTML = `$$ ${model.formula} $$`;
        
        // Try multiple ways to render the formula
        if (window.MathJax) {
            if (window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([formulaContainer]).catch(() => {
                    console.log('MathJax typeset failed');
                });
            } else if (window.MathJax.Hub) {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, formulaContainer]);
            }
        } else {
            // Fallback - show plain text version
            formulaContainer.innerHTML = `<pre>
τₑ dE/dt = -E + (1 - E) S(aE - bI - θₑ + P)
τᵢ dI/dt = -I + (1 - I) S(cE - dI - θᵢ + Q)
            </pre>`;
        }
    }

    function createSliders(model) {
        slidersContainer.innerHTML = '';
        currentParams = {};
        for (const param in model.params) {
            const p = model.params[param];
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';

            const label = document.createElement('label');
            label.setAttribute('for', param);
            
            const valueSpan = document.createElement('span');
            valueSpan.id = `${param}-value`;
            valueSpan.textContent = p.value;
            
            label.innerHTML = `\\(${p.latex || param}\\) = `;
            label.appendChild(valueSpan);

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = param;
            slider.min = p.min;
            slider.max = p.max;
            slider.value = p.value;
            slider.step = p.step;

            slider.addEventListener('input', function() {
                currentParams[param] = parseFloat(this.value);
                valueSpan.textContent = this.value;
                updatePlot();
            });

            // Create range controls
            const rangeControls = document.createElement('div');
            rangeControls.className = 'range-controls';
            
            // Min controls
            const minDecreaseBtn = document.createElement('button');
            minDecreaseBtn.className = 'range-btn';
            minDecreaseBtn.textContent = '-';
            minDecreaseBtn.title = 'Decrease minimum';
            
            const minInput = document.createElement('input');
            minInput.className = 'range-input';
            minInput.type = 'number';
            minInput.value = p.min;
            minInput.step = p.step;
            
            const minIncreaseBtn = document.createElement('button');
            minIncreaseBtn.className = 'range-btn';
            minIncreaseBtn.textContent = '+';
            minIncreaseBtn.title = 'Increase minimum';
            
            // Max controls
            const maxDecreaseBtn = document.createElement('button');
            maxDecreaseBtn.className = 'range-btn';
            maxDecreaseBtn.textContent = '-';
            maxDecreaseBtn.title = 'Decrease maximum';
            
            const maxInput = document.createElement('input');
            maxInput.className = 'range-input';
            maxInput.type = 'number';
            maxInput.value = p.max;
            maxInput.step = p.step;
            
            const maxIncreaseBtn = document.createElement('button');
            maxIncreaseBtn.className = 'range-btn';
            maxIncreaseBtn.textContent = '+';
            maxIncreaseBtn.title = 'Increase maximum';

            // Event listeners for range controls
            function updateSliderRange() {
                const newMin = parseFloat(minInput.value);
                const newMax = parseFloat(maxInput.value);
                
                if (newMin < newMax) {
                    slider.min = newMin;
                    slider.max = newMax;
                    
                    // Keep current value within new range
                    if (parseFloat(slider.value) < newMin) {
                        slider.value = newMin;
                        currentParams[param] = newMin;
                        valueSpan.textContent = newMin;
                    } else if (parseFloat(slider.value) > newMax) {
                        slider.value = newMax;
                        currentParams[param] = newMax;
                        valueSpan.textContent = newMax;
                    }
                    
                    updatePlot();
                }
            }

            minDecreaseBtn.addEventListener('click', () => {
                minInput.value = (parseFloat(minInput.value) - parseFloat(p.step)).toFixed(3);
                updateSliderRange();
            });

            minIncreaseBtn.addEventListener('click', () => {
                const newMin = parseFloat(minInput.value) + parseFloat(p.step);
                if (newMin < parseFloat(maxInput.value)) {
                    minInput.value = newMin.toFixed(3);
                    updateSliderRange();
                }
            });

            maxDecreaseBtn.addEventListener('click', () => {
                const newMax = parseFloat(maxInput.value) - parseFloat(p.step);
                if (newMax > parseFloat(minInput.value)) {
                    maxInput.value = newMax.toFixed(3);
                    updateSliderRange();
                }
            });

            maxIncreaseBtn.addEventListener('click', () => {
                maxInput.value = (parseFloat(maxInput.value) + parseFloat(p.step)).toFixed(3);
                updateSliderRange();
            });

            minInput.addEventListener('change', updateSliderRange);
            maxInput.addEventListener('change', updateSliderRange);

            // Assemble range controls
            rangeControls.appendChild(minDecreaseBtn);
            rangeControls.appendChild(minInput);
            rangeControls.appendChild(minIncreaseBtn);
            rangeControls.appendChild(document.createTextNode(' — '));
            rangeControls.appendChild(maxDecreaseBtn);
            rangeControls.appendChild(maxInput);
            rangeControls.appendChild(maxIncreaseBtn);

            sliderContainer.appendChild(label);
            sliderContainer.appendChild(slider);
            sliderContainer.appendChild(rangeControls);
            slidersContainer.appendChild(sliderContainer);
            currentParams[param] = p.value;
        }
        
        // Render LaTeX in slider labels
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([slidersContainer]).catch(() => {
                console.log('MathJax typeset failed for sliders');
            });
        }
    }

    function rk4(ode, y0, t0, tf, dt) {
        let t = t0;
        let y = y0;
        const points = [[...y]];
        while (t < tf) {
            if (points.length > 5000) break; // Safety break
            const k1 = ode(t, y).map(v => v * dt);
            const k2 = ode(t + dt / 2, y.map((v, i) => v + k1[i] / 2)).map(v => v * dt);
            const k3 = ode(t + dt / 2, y.map((v, i) => v + k2[i] / 2)).map(v => v * dt);
            const k4 = ode(t + dt, y.map((v, i) => v + k3[i])).map(v => v * dt);
            y = y.map((v, i) => v + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) / 6);
            points.push([...y]);
            t += dt;
        }
        return points;
    }



    modelSelect.addEventListener('change', function() {
        const model = models[this.value];
        createSliders(model);
        initializeAxisRanges(model);
        updateFormula(model);
        resetSimulation();
        updatePlot();
    });

    tmaxSlider.addEventListener('input', function() {
        tmax_value.textContent = this.value;
        if (!isSimulating) {
            updatePlot();
        }
    });
    
    // X-axis range controls
    function updateXAxisRange() {
        const newMin = parseFloat(xlimMinInput.value);
        const newMax = parseFloat(xlimMaxInput.value);
        
        if (newMin < newMax) {
            xlimValue.textContent = `[${newMin}, ${newMax}]`;
            
            if (!isSimulating) {
                updatePlot();
            }
        }
    }

    xlimMinDecrease.addEventListener('click', () => {
        xlimMinInput.value = (parseFloat(xlimMinInput.value) - 0.1).toFixed(1);
        updateXAxisRange();
    });

    xlimMinIncrease.addEventListener('click', () => {
        const newMin = parseFloat(xlimMinInput.value) + 0.1;
        if (newMin < parseFloat(xlimMaxInput.value)) {
            xlimMinInput.value = newMin.toFixed(1);
            updateXAxisRange();
        }
    });

    xlimMaxDecrease.addEventListener('click', () => {
        const newMax = parseFloat(xlimMaxInput.value) - 0.1;
        if (newMax > parseFloat(xlimMinInput.value)) {
            xlimMaxInput.value = newMax.toFixed(1);
            updateXAxisRange();
        }
    });

    xlimMaxIncrease.addEventListener('click', () => {
        xlimMaxInput.value = (parseFloat(xlimMaxInput.value) + 0.1).toFixed(1);
        updateXAxisRange();
    });

    xlimMinInput.addEventListener('change', updateXAxisRange);
    xlimMaxInput.addEventListener('change', updateXAxisRange);

    // Y-axis range controls
    function updateYAxisRange() {
        const newMin = parseFloat(ylimMinInput.value);
        const newMax = parseFloat(ylimMaxInput.value);
        
        if (newMin < newMax) {
            ylimValue.textContent = `[${newMin}, ${newMax}]`;
            
            if (!isSimulating) {
                updatePlot();
            }
        }
    }

    // Plot 2 range controls
    function updateXAxis2Range() {
        const newMin = parseFloat(xlim2MinInput.value);
        const newMax = parseFloat(xlim2MaxInput.value);
        if (newMin < newMax) {
            xlim2Value.textContent = `[${newMin}, ${newMax}]`;
            if (!isSimulating) updatePlot();
        }
    }
    function updateYAxis2Range() {
        const newMin = parseFloat(ylim2MinInput.value);
        const newMax = parseFloat(ylim2MaxInput.value);
        if (newMin < newMax) {
            ylim2Value.textContent = `[${newMin}, ${newMax}]`;
            if (!isSimulating) updatePlot();
        }
    }
    if (plot2Controls) {
        xlim2MinDecrease.addEventListener('click', () => { xlim2MinInput.value = (parseFloat(xlim2MinInput.value) - 0.1).toFixed(1); updateXAxis2Range(); });
        xlim2MinIncrease.addEventListener('click', () => { const v = parseFloat(xlim2MinInput.value) + 0.1; if (v < parseFloat(xlim2MaxInput.value)) { xlim2MinInput.value = v.toFixed(1); updateXAxis2Range(); } });
        xlim2MaxDecrease.addEventListener('click', () => { const v = parseFloat(xlim2MaxInput.value) - 0.1; if (v > parseFloat(xlim2MinInput.value)) { xlim2MaxInput.value = v.toFixed(1); updateXAxis2Range(); } });
        xlim2MaxIncrease.addEventListener('click', () => { xlim2MaxInput.value = (parseFloat(xlim2MaxInput.value) + 0.1).toFixed(1); updateXAxis2Range(); });
        xlim2MinInput.addEventListener('change', updateXAxis2Range);
        xlim2MaxInput.addEventListener('change', updateXAxis2Range);
        ylim2MinDecrease.addEventListener('click', () => { ylim2MinInput.value = (parseFloat(ylim2MinInput.value) - 0.1).toFixed(1); updateYAxis2Range(); });
        ylim2MinIncrease.addEventListener('click', () => { const v = parseFloat(ylim2MinInput.value) + 0.1; if (v < parseFloat(ylim2MaxInput.value)) { ylim2MinInput.value = v.toFixed(1); updateYAxis2Range(); } });
        ylim2MaxDecrease.addEventListener('click', () => { const v = parseFloat(ylim2MaxInput.value) - 0.1; if (v > parseFloat(ylim2MinInput.value)) { ylim2MaxInput.value = v.toFixed(1); updateYAxis2Range(); } });
        ylim2MaxIncrease.addEventListener('click', () => { ylim2MaxInput.value = (parseFloat(ylim2MaxInput.value) + 0.1).toFixed(1); updateYAxis2Range(); });
        ylim2MinInput.addEventListener('change', updateYAxis2Range);
        ylim2MaxInput.addEventListener('change', updateYAxis2Range);
    }

    ylimMinDecrease.addEventListener('click', () => {
        ylimMinInput.value = (parseFloat(ylimMinInput.value) - 0.1).toFixed(1);
        updateYAxisRange();
    });

    ylimMinIncrease.addEventListener('click', () => {
        const newMin = parseFloat(ylimMinInput.value) + 0.1;
        if (newMin < parseFloat(ylimMaxInput.value)) {
            ylimMinInput.value = newMin.toFixed(1);
            updateYAxisRange();
        }
    });

    ylimMaxDecrease.addEventListener('click', () => {
        const newMax = parseFloat(ylimMaxInput.value) - 0.1;
        if (newMax > parseFloat(ylimMinInput.value)) {
            ylimMaxInput.value = newMax.toFixed(1);
            updateYAxisRange();
        }
    });

    ylimMaxIncrease.addEventListener('click', () => {
        ylimMaxInput.value = (parseFloat(ylimMaxInput.value) + 0.1).toFixed(1);
        updateYAxisRange();
    });

    ylimMinInput.addEventListener('change', updateYAxisRange);
    ylimMaxInput.addEventListener('change', updateYAxisRange);

    solverSelect.addEventListener('change', function() {
        if (!isSimulating) {
            updatePlot();
        }
    });

    clearTrajectoriesBtn.addEventListener('click', function() {
        trajectories = [];
        updatePlot();
    });

    // Continuous simulation functions
    function updateTimePlot() {
        const timeWindow = parseFloat(timeWindowSlider.value);
        const selectedModel = models[modelSelect.value];
        
        // Filter data to show only the current time window
        const filteredData = timeData.filter(point => point.t >= currentTime - timeWindow);
        
    const axes0 = (selectedModel.plots && selectedModel.plots[0] && selectedModel.plots[0].axes) || selectedModel.plot_axes || ['Var1','Var2'];
        const traces = [
            {
                x: filteredData.map(p => p.t),
                y: filteredData.map(p => p.E),
                mode: 'lines',
        name: axes0[0],
                line: { color: 'red', width: 2 }
            },
            {
                x: filteredData.map(p => p.t),
                y: filteredData.map(p => p.I),
                mode: 'lines',
        name: axes0[1],
                line: { color: 'blue', width: 2 },
                yaxis: 'y2'
            }
        ];

        const layout = {
            title: 'Time Series (Oscilloscope View)',
            xaxis: { 
                title: 'Time (s)',
                range: [Math.max(0, currentTime - timeWindow), currentTime + 1]
            },
            yaxis: { 
        title: axes0[0],
                side: 'left',
                color: 'red'
            },
            yaxis2: {
        title: axes0[1],
                side: 'right',
                overlaying: 'y',
                color: 'blue'
            },
            margin: { l: 50, r: 50, b: 50, t: 50 },
            showlegend: true
        };

        Plotly.react(timePlotDiv, traces, layout);

        // Second time plot for coupled model (plots[1])
        const container2 = document.getElementById('time-plot2-container');
        const p2 = selectedModel.plots && selectedModel.plots[1];
        if (p2 && timePlotDiv2) {
            container2.style.display = '';
            const axes1 = p2.axes || ['Var3','Var4'];
            // For now, mirror the time series using E2/I2 from currentState indices 2/3 stored as E/I not tracked separately; reuse E/I fields for simplicity
            const traces2 = [
                {
                    x: filteredData.map(p => p.t),
                    y: filteredData.map(p => p.E2 ?? p.E),
                    mode: 'lines',
                    name: axes1[0],
                    line: { color: 'purple', width: 2 }
                },
                {
                    x: filteredData.map(p => p.t),
                    y: filteredData.map(p => p.I2 ?? p.I),
                    mode: 'lines',
                    name: axes1[1],
                    line: { color: 'green', width: 2 },
                    yaxis: 'y2'
                }
            ];
            const layout2 = {
                title: 'Time Series 2 (Oscillator 2)',
                xaxis: { title: 'Time (s)', range: [Math.max(0, currentTime - timeWindow), currentTime + 1] },
                yaxis: { title: axes1[0], side: 'left', color: 'purple' },
                yaxis2: { title: axes1[1], side: 'right', overlaying: 'y', color: 'green' },
                margin: { l: 50, r: 50, b: 50, t: 50 },
                showlegend: true
            };
            Plotly.react(timePlotDiv2, traces2, layout2);
        } else if (container2) {
            container2.style.display = 'none';
        }
    }

    function simulationStep() {
        if (!isSimulating) return;
        
        const selectedModel = models[modelSelect.value];
        const ode = getOdeFunction(selectedModel, currentParams);
        const dt = 0.01; // Small time step for smooth animation
        const speed = parseFloat(speedSlider.value);
        
        // Integrate one step
        const derivatives = ode(currentTime, currentState);
        
        for (let i = 0; i < currentState.length; i++) {
            currentState[i] += derivatives[i] * dt * speed;
        }
        currentTime += dt * speed;
        
        // Store data point (for time series plot)
        const point = { t: currentTime };
        // Always store first two variables as E/I for backward compatibility
        point.E = currentState[0];
        point.I = currentState[1];
        // If system has 4D (coupled model), also store E2/I2
        if (currentState.length > 3) {
            point.E2 = currentState[2];
            point.I2 = currentState[3];
        }
        timeData.push(point);
        
        // Limit data storage to prevent memory issues
        const maxPoints = 10000;
        if (timeData.length > maxPoints) {
            timeData = timeData.slice(-maxPoints);
        }
        
        // Update plots
        updateTimePlot();
        
        // Update phase plane with current point
        updatePhasePlot();
    }

    function updatePhasePlot() {
        const selectedModel = models[modelSelect.value];
        const ode = getOdeFunction(selectedModel, currentParams);

        // Helper to build one plot's data/layout from indices and ranges
        function buildPlot(indices, axesLabels, xMin, xMax, yMin, yMax) {
            const xIdx = indices[0];
            const yIdx = indices[1];
            const plotData = [];

            // Vector field
            const gridSize = 20;
            const x_coords = [];
            const y_coords = [];
            const scale = Math.min(xMax - xMin, yMax - yMin) * 0.02;
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const x = xMin + (i / (gridSize - 1)) * (xMax - xMin);
                    const y = yMin + (j / (gridSize - 1)) * (yMax - yMin);

                    const state = new Array(selectedModel.initial_conditions.length).fill(0);
                    state[xIdx] = x;
                    state[yIdx] = y;
                    const d = ode(0, state);
                    const dx = d[xIdx];
                    const dy = d[yIdx];
                    const norm = Math.hypot(dx, dy);
                    if (norm > 0) {
                        const dxn = (dx / norm) * scale;
                        const dyn = (dy / norm) * scale;
                        x_coords.push(x, x + dxn, null);
                        y_coords.push(y, y + dyn, null);
                    }
                }
            }
            plotData.push({ x: x_coords, y: y_coords, mode: 'lines', type: 'scatter', name: 'Vector Field', line: { color: 'rgba(0,0,255,0.3)', width: 1 }, hoverinfo: 'skip' });

            // Trajectories
            const t_max = parseFloat(tmaxSlider.value);
            const solver = solverSelect.value;
            trajectories.forEach((traj, index) => {
                let y;
                if (solver === 'dopri') {
                    const sol = numeric.dopri(0, t_max, traj.y0, ode, 1e-6, 2000);
                    y = sol.y;
                } else {
                    const dt = 0.1;
                    y = rk4(ode, traj.y0, 0, t_max, dt);
                }
                plotData.push({
                    x: y.map(pt => pt[xIdx]),
                    y: y.map(pt => pt[yIdx]),
                    mode: 'lines', type: 'scatter', name: `Trajectory ${index + 1}`,
                    line: { width: 2, color: `hsl(${(index * 137.5) % 360}, 70%, 50%)` }, hoverinfo: 'skip'
                });
                plotData.push({ x: [traj.y0[xIdx]], y: [traj.y0[yIdx]], mode: 'markers', type: 'scatter', name: `IC ${index + 1}`,
                    marker: { size: 8, color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, symbol: 'circle', line: { width: 2, color: 'white' } }, hoverinfo: 'skip' });
            });

            // Current state
            if (isSimulating) {
                plotData.push({ x: [currentState[xIdx]], y: [currentState[yIdx]], mode: 'markers', type: 'scatter', name: 'Current State', marker: { size: 10, color: 'red', symbol: 'circle' } });
            }

            const layout = { title: `${selectedModel.name} (${axesLabels[0]} vs ${axesLabels[1]})`, xaxis: { title: axesLabels[0], range: [xMin, xMax], autorange: false }, yaxis: { title: axesLabels[1], range: [yMin, yMax], autorange: false }, margin: { l: 50, r: 50, b: 50, t: 50 }, showlegend: false };
            return { plotData, layout };
        }

        // Determine first plot ranges from UI controls
        const xMin1 = parseFloat(xlimMinInput.value);
        const xMax1 = parseFloat(xlimMaxInput.value);
        const yMin1 = parseFloat(ylimMinInput.value);
        const yMax1 = parseFloat(ylimMaxInput.value);

    const plotsCfg = selectedModel.plots || [{ indices: [0,1], axes: selectedModel.plot_axes || ['x','y'], axis_ranges: { x: {min: xMin1, max: xMax1}, y: {min: yMin1, max: yMax1} } }];
        const p1 = plotsCfg[0];
        const built1 = buildPlot(p1.indices, p1.axes, xMin1, xMax1, yMin1, yMax1);

        Plotly.react(plotDiv, built1.plotData, built1.layout).then(() => {
            // Clean up all existing event listeners
            plotDiv.removeAllListeners('plotly_click');
            
            // Remove DOM event listeners to prevent duplicates
            const existingHandler = plotDiv._clickHandler;
            if (existingHandler) {
                plotDiv.removeEventListener('click', existingHandler);
            }
            
            // Plotly click handler (for clicks on data)
            plotDiv.on('plotly_click', function(data) {
                if (data.points && data.points.length > 0) {
                    const point = data.points[0];
                    if (point.curveNumber === 0) {
                        const new_x = point.x;
                        const new_y = point.y;
                        const xlim_min = parseFloat(xlimMinInput.value);
                        const xlim_max = parseFloat(xlimMaxInput.value);
                        const ylim_min = parseFloat(ylimMinInput.value);
                        const ylim_max = parseFloat(ylimMaxInput.value);
                        if (new_x >= xlim_min && new_x <= xlim_max && new_y >= ylim_min && new_y <= ylim_max && !isSimulating) {
                            const initialCondition = [...selectedModel.initial_conditions];
                            const xIdx = p1.indices[0];
                            const yIdx = p1.indices[1];
                            initialCondition[xIdx] = new_x;
                            initialCondition[yIdx] = new_y;
                            trajectories.push({ y0: initialCondition });
                            setTimeout(() => updatePlot(), 10);
                        }
                    }
                }
            });
            
            // Direct DOM click handler (backup for all clicks)
            const clickHandler = function(event) {
                if (clickTimeout) return;
                clickTimeout = setTimeout(() => { clickTimeout = null; }, 300);
                const rect = plotDiv.getBoundingClientRect();
                const x_pixel = event.clientX - rect.left;
                const y_pixel = event.clientY - rect.top;
                const layout = plotDiv._fullLayout;
                if (layout && layout.xaxis && layout.yaxis) {
                    const xaxis = layout.xaxis;
                    const yaxis = layout.yaxis;
                    const plotWidth = xaxis._length;
                    const plotHeight = yaxis._length;
                    const plotLeft = xaxis._offset;
                    const plotBottom = yaxis._offset;
                    const relativeX = (x_pixel - plotLeft) / plotWidth;
                    const relativeY = (y_pixel - plotBottom) / plotHeight;
                    const xlim_min = parseFloat(xlimMinInput.value);
                    const xlim_max = parseFloat(xlimMaxInput.value);
                    const ylim_min = parseFloat(ylimMinInput.value);
                    const ylim_max = parseFloat(ylimMaxInput.value);
                    const alt_x = xlim_min + relativeX * (xlim_max - xlim_min);
                    const alt_y = ylim_min + (1 - relativeY) * (ylim_max - ylim_min);
                    if (alt_x >= xlim_min && alt_x <= xlim_max && alt_y >= ylim_min && alt_y <= ylim_max && !isSimulating) {
                        const initialCondition = [...selectedModel.initial_conditions];
                        const xIdx = p1.indices[0];
                        const yIdx = p1.indices[1];
                        initialCondition[xIdx] = alt_x;
                        initialCondition[yIdx] = alt_y;
                        trajectories.push({ y0: initialCondition });
                        setTimeout(() => updatePlot(), 50);
                    }
                }
            };
            plotDiv._clickHandler = clickHandler;
            plotDiv.addEventListener('click', clickHandler);
        });

        // Handle second plot (if available)
        const p2 = plotsCfg[1];
        const container2 = document.getElementById('phase-plot2-container');
        if (p2 && plotDiv2) {
            // Use UI values if present, otherwise fall back to config
            const x2min = isFinite(parseFloat(xlim2MinInput.value)) ? parseFloat(xlim2MinInput.value)
                : ((p2.axis_ranges && p2.axis_ranges.x && typeof p2.axis_ranges.x.min === 'number') ? p2.axis_ranges.x.min : xMin1);
            const x2max = isFinite(parseFloat(xlim2MaxInput.value)) ? parseFloat(xlim2MaxInput.value)
                : ((p2.axis_ranges && p2.axis_ranges.x && typeof p2.axis_ranges.x.max === 'number') ? p2.axis_ranges.x.max : xMax1);
            const y2min = isFinite(parseFloat(ylim2MinInput.value)) ? parseFloat(ylim2MinInput.value)
                : ((p2.axis_ranges && p2.axis_ranges.y && typeof p2.axis_ranges.y.min === 'number') ? p2.axis_ranges.y.min : yMin1);
            const y2max = isFinite(parseFloat(ylim2MaxInput.value)) ? parseFloat(ylim2MaxInput.value)
                : ((p2.axis_ranges && p2.axis_ranges.y && typeof p2.axis_ranges.y.max === 'number') ? p2.axis_ranges.y.max : yMax1);
            const built2 = buildPlot(p2.indices, p2.axes, x2min, x2max, y2min, y2max);
            container2.style.display = '';
            Plotly.react(plotDiv2, built2.plotData, built2.layout).then(() => {
                // Clean up old handlers
                plotDiv2.removeAllListeners && plotDiv2.removeAllListeners('plotly_click');
                const existingHandler2 = plotDiv2._clickHandler;
                if (existingHandler2) plotDiv2.removeEventListener('click', existingHandler2);
                // Plotly click for second plot
                plotDiv2.on && plotDiv2.on('plotly_click', function(data) {
                    if (data.points && data.points.length > 0) {
                        const point = data.points[0];
                        if (point.curveNumber === 0) {
                            const new_x = point.x;
                            const new_y = point.y;
                            if (!isSimulating) {
                                const initialCondition = [...selectedModel.initial_conditions];
                                const xIdx = p2.indices[0];
                                const yIdx = p2.indices[1];
                                initialCondition[xIdx] = new_x;
                                initialCondition[yIdx] = new_y;
                                trajectories.push({ y0: initialCondition });
                                setTimeout(() => updatePlot(), 10);
                            }
                        }
                    }
                });
                // DOM click for second plot
                const clickHandler2 = function(event) {
                    if (clickTimeout) return;
                    clickTimeout = setTimeout(() => { clickTimeout = null; }, 300);
                    const rect = plotDiv2.getBoundingClientRect();
                    const x_pixel = event.clientX - rect.left;
                    const y_pixel = event.clientY - rect.top;
                    const layout = plotDiv2._fullLayout;
                    if (layout && layout.xaxis && layout.yaxis) {
                        const xaxis = layout.xaxis;
                        const yaxis = layout.yaxis;
                        const plotWidth = xaxis._length;
                        const plotHeight = yaxis._length;
                        const plotLeft = xaxis._offset;
                        const plotBottom = yaxis._offset;
                        const relativeX = (x_pixel - plotLeft) / plotWidth;
                        const relativeY = (y_pixel - plotBottom) / plotHeight;
                        const xlim_min = isFinite(parseFloat(xlim2MinInput.value)) ? parseFloat(xlim2MinInput.value)
                            : ((p2.axis_ranges && p2.axis_ranges.x && typeof p2.axis_ranges.x.min === 'number') ? p2.axis_ranges.x.min : xMin1);
                        const xlim_max = isFinite(parseFloat(xlim2MaxInput.value)) ? parseFloat(xlim2MaxInput.value)
                            : ((p2.axis_ranges && p2.axis_ranges.x && typeof p2.axis_ranges.x.max === 'number') ? p2.axis_ranges.x.max : xMax1);
                        const ylim_min = isFinite(parseFloat(ylim2MinInput.value)) ? parseFloat(ylim2MinInput.value)
                            : ((p2.axis_ranges && p2.axis_ranges.y && typeof p2.axis_ranges.y.min === 'number') ? p2.axis_ranges.y.min : yMin1);
                        const ylim_max = isFinite(parseFloat(ylim2MaxInput.value)) ? parseFloat(ylim2MaxInput.value)
                            : ((p2.axis_ranges && p2.axis_ranges.y && typeof p2.axis_ranges.y.max === 'number') ? p2.axis_ranges.y.max : yMax1);
                        const alt_x = xlim_min + relativeX * (xlim_max - xlim_min);
                        const alt_y = ylim_min + (1 - relativeY) * (ylim_max - ylim_min);
                        if (alt_x >= xlim_min && alt_x <= xlim_max && alt_y >= ylim_min && alt_y <= ylim_max && !isSimulating) {
                            const initialCondition = [...selectedModel.initial_conditions];
                            const xIdx = p2.indices[0];
                            const yIdx = p2.indices[1];
                            initialCondition[xIdx] = alt_x;
                            initialCondition[yIdx] = alt_y;
                            trajectories.push({ y0: initialCondition });
                            setTimeout(() => updatePlot(), 50);
                        }
                    }
                };
                plotDiv2._clickHandler = clickHandler2;
                plotDiv2.addEventListener('click', clickHandler2);
            });
        } else if (container2) {
            container2.style.display = 'none';
        }
    }

    function startSimulation() {
        isSimulating = true;
        startSimBtn.disabled = true;
        stopSimBtn.disabled = false;
        resetSimBtn.disabled = false;
        
        // Start from current state or default
        simulationInterval = setInterval(simulationStep, 50); // 20 FPS
    }

    function stopSimulation() {
        isSimulating = false;
        startSimBtn.disabled = false;
        stopSimBtn.disabled = true;
        
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
        }
        
        updatePlot(); // Restore click handlers
    }

    function resetSimulation() {
        stopSimulation();
        currentTime = 0;
        timeData = [];
        const selectedModel = models[modelSelect.value];
        currentState = [...selectedModel.initial_conditions];
        updateTimePlot();
        updatePlot();
        resetSimBtn.disabled = true;
    }

    // Event listeners for continuous simulation
    startSimBtn.addEventListener('click', startSimulation);
    stopSimBtn.addEventListener('click', stopSimulation);
    resetSimBtn.addEventListener('click', resetSimulation);

    speedSlider.addEventListener('input', function() {
        speedValue.textContent = parseFloat(this.value).toFixed(1);
    });

    timeWindowSlider.addEventListener('input', function() {
        timeWindowValue.textContent = this.value;
        if (isSimulating || timeData.length > 0) {
            updateTimePlot();
        }
    });

    // Update the original updatePlot function to use the new phase plot function
    function updatePlot() {
        updatePhasePlot();
    }

    // Start loading models when DOM is ready
    loadModels();
});
