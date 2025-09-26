document.addEventListener('DOMContentLoaded', function() {
    const modelSelect = document.getElementById('model-select');
    const slidersContainer = document.getElementById('sliders');
    const plotDiv = document.getElementById('plot');
    const plotDivSecondary = document.getElementById('plot2');
    const formulaContainer = document.getElementById('formula-container');
    const tmaxSlider = document.getElementById('tmax-slider');
    const tmax_value = document.getElementById('tmax-value');
    const solverSelect = document.getElementById('solver-select');
    const xlimValue = document.getElementById('xlim-value');
    const ylimValue = document.getElementById('ylim-value');
    const clearTrajectoriesBtn = document.getElementById('clear-trajectories');
    const phasePlotContainer = document.getElementById('phase-plot-container');
    const phasePlot2Container = document.getElementById('phase-plot2-container');
    const plot2Controls = document.getElementById('plot2-controls');
    
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

    const xlim2Value = document.getElementById('xlim2-value');
    const xlim2MinInput = document.getElementById('xlim2-min-input');
    const xlim2MaxInput = document.getElementById('xlim2-max-input');
    const xlim2MinDecrease = document.getElementById('xlim2-min-decrease');
    const xlim2MinIncrease = document.getElementById('xlim2-min-increase');
    const xlim2MaxDecrease = document.getElementById('xlim2-max-decrease');
    const xlim2MaxIncrease = document.getElementById('xlim2-max-increase');

    const ylim2Value = document.getElementById('ylim2-value');
    const ylim2MinInput = document.getElementById('ylim2-min-input');
    const ylim2MaxInput = document.getElementById('ylim2-max-input');
    const ylim2MinDecrease = document.getElementById('ylim2-min-decrease');
    const ylim2MinIncrease = document.getElementById('ylim2-min-increase');
    const ylim2MaxDecrease = document.getElementById('ylim2-max-decrease');
    const ylim2MaxIncrease = document.getElementById('ylim2-max-increase');
    
    const phaseAxisControls = [
        {
            x: {
                label: xlimValue,
                minInput: xlimMinInput,
                maxInput: xlimMaxInput,
                decreaseMin: xlimMinDecrease,
                increaseMin: xlimMinIncrease,
                decreaseMax: xlimMaxDecrease,
                increaseMax: xlimMaxIncrease
            },
            y: {
                label: ylimValue,
                minInput: ylimMinInput,
                maxInput: ylimMaxInput,
                decreaseMin: ylimMinDecrease,
                increaseMin: ylimMinIncrease,
                decreaseMax: ylimMaxDecrease,
                increaseMax: ylimMaxIncrease
            }
        },
        {
            x: {
                label: xlim2Value,
                minInput: xlim2MinInput,
                maxInput: xlim2MaxInput,
                decreaseMin: xlim2MinDecrease,
                increaseMin: xlim2MinIncrease,
                decreaseMax: xlim2MaxDecrease,
                increaseMax: xlim2MaxIncrease
            },
            y: {
                label: ylim2Value,
                minInput: ylim2MinInput,
                maxInput: ylim2MaxInput,
                decreaseMin: ylim2MinDecrease,
                increaseMin: ylim2MinIncrease,
                decreaseMax: ylim2MaxDecrease,
                increaseMax: ylim2MaxIncrease
            }
        }
    ];

    // Continuous simulation elements
    const startSimBtn = document.getElementById('start-simulation');
    const stopSimBtn = document.getElementById('stop-simulation');
    const resetSimBtn = document.getElementById('reset-simulation');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const timeWindowSlider = document.getElementById('time-window-slider');
    const timeWindowValue = document.getElementById('time-window-value');
    const timePlotDiv = document.getElementById('time-plot');
    const timePlotDivSecondary = document.getElementById('time-plot2');
    const timePlotContainer = document.getElementById('time-plot-container');
    const timePlot2Container = document.getElementById('time-plot2-container');

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
    let phaseGroups = [];
    let phaseAxisRanges = [];

    // Load models from JSON file
    async function loadModels() {
        try {
            const response = await fetch('models.json');
            const modelsData = await response.json();
            models = modelsData;
            normalizeModelConfigs(models);
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
        normalizeModelConfigs(models);
    }

    function normalizeModelConfigs(modelsObj) {
        const normalizeAxis = (range) => {
            const min = range && range.min !== undefined ? range.min : 0;
            const maxValue = range && range.max !== undefined ? range.max : 1;
            const initialMax = range && range.initial_max !== undefined ? range.initial_max : maxValue;
            return { min, max: maxValue, initial_max: initialMax };
        };

        for (const key in modelsObj) {
            const model = modelsObj[key];
            if (!model || typeof model !== 'object') {
                continue;
            }

            const rawGroups = Array.isArray(model.phase_groups) && model.phase_groups.length > 0
                ? model.phase_groups
                : (Array.isArray(model.plots) && model.plots.length > 0
                    ? model.plots
                    : [{
                        indices: Array.isArray(model.plot_indices) ? model.plot_indices : [0, 1],
                        axes: Array.isArray(model.plot_axes) ? model.plot_axes : undefined,
                        axis_ranges: model.axis_ranges
                    }]);

            const normalizedGroups = rawGroups.map((group, index) => {
                const indices = Array.isArray(group.indices) && group.indices.length >= 2
                    ? group.indices.slice(0, 2)
                    : [0, 1];

                const axes = Array.isArray(group.axes) && group.axes.length >= 2
                    ? group.axes.slice(0, 2)
                    : [`Variable ${indices[0] + 1}`, `Variable ${indices[1] + 1}`];

                const axisRangesSource = group.axis_ranges && typeof group.axis_ranges === 'object'
                    ? group.axis_ranges
                    : {};

                return {
                    name: group.name || `Grupo ${index + 1}`,
                    indices,
                    axes,
                    axis_ranges: {
                        x: normalizeAxis(axisRangesSource.x || {}),
                        y: normalizeAxis(axisRangesSource.y || {})
                    }
                };
            });

            model.phase_groups = normalizedGroups;

            const primaryGroup = normalizedGroups[0];
            model.plot_indices = primaryGroup.indices;
            model.plot_axes = primaryGroup.axes;
            model.axis_ranges = primaryGroup.axis_ranges;

            if (model.requires_all_phase_groups === undefined) {
                model.requires_all_phase_groups = normalizedGroups.length > 1;
            }
        }
    }

    function applyAxisRangesToInputs(groupIndex) {
        const range = phaseAxisRanges[groupIndex];
        const controls = phaseAxisControls[groupIndex];
        if (!range || !controls) {
            return;
        }

        controls.x.minInput.value = range.x.min;
        controls.x.maxInput.value = range.x.max;
        controls.x.label.textContent = `[${range.x.min}, ${range.x.max}]`;

        controls.y.minInput.value = range.y.min;
        controls.y.maxInput.value = range.y.max;
        controls.y.label.textContent = `[${range.y.min}, ${range.y.max}]`;
    }

    // Initialize axis ranges from model configuration
    function initializeAxisRanges(model) {
        const groups = Array.isArray(model.phase_groups) && model.phase_groups.length > 0
            ? model.phase_groups
            : [{
                name: `${model.plot_axes[0]} vs ${model.plot_axes[1]}`,
                indices: model.plot_indices,
                axes: model.plot_axes,
                axis_ranges: model.axis_ranges
            }];

        phaseGroups = groups;
        phaseAxisRanges = groups.map(group => {
            const xConfig = group.axis_ranges?.x || {};
            const yConfig = group.axis_ranges?.y || {};

            return {
                x: {
                    min: xConfig.min !== undefined ? xConfig.min : 0,
                    max: xConfig.initial_max !== undefined
                        ? xConfig.initial_max
                        : (xConfig.max !== undefined ? xConfig.max : 1)
                },
                y: {
                    min: yConfig.min !== undefined ? yConfig.min : 0,
                    max: yConfig.initial_max !== undefined
                        ? yConfig.initial_max
                        : (yConfig.max !== undefined ? yConfig.max : 1)
                }
            };
        });

        applyAxisRangesToInputs(0);

        const hasSecondaryGroup = phaseGroups.length > 1;
        if (hasSecondaryGroup) {
            applyAxisRangesToInputs(1);
        }

        if (plot2Controls) {
            plot2Controls.style.display = hasSecondaryGroup ? 'block' : 'none';
        }

        if (phasePlot2Container) {
            if (hasSecondaryGroup) {
                phasePlot2Container.style.display = 'block';
            } else {
                phasePlot2Container.style.display = 'none';
                if (plotDivSecondary) {
                    Plotly.purge(plotDivSecondary);
                }
            }
        }

        if (timePlot2Container) {
            if (hasSecondaryGroup) {
                timePlot2Container.style.display = 'block';
            } else {
                timePlot2Container.style.display = 'none';
                if (timePlotDivSecondary) {
                    Plotly.purge(timePlotDivSecondary);
                }
            }
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
                        if (plotDivSecondary && phasePlot2Container && phasePlot2Container.style.display !== 'none') {
                            Plotly.Plots.resize(plotDivSecondary);
                        }
                    }, 100);
                }
            });
            
            const timeResizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    clearTimeout(window.timeResizeTimeout);
                    window.timeResizeTimeout = setTimeout(() => {
                        Plotly.Plots.resize(timePlotDiv);
                        if (timePlotDivSecondary && timePlot2Container && timePlot2Container.style.display !== 'none') {
                            Plotly.Plots.resize(timePlotDivSecondary);
                        }
                    }, 100);
                }
            });
            
            phaseResizeObserver.observe(phaseContainer);
            timeResizeObserver.observe(timeContainer);
            if (phaseContainer2) {
                phaseResizeObserver.observe(phaseContainer2);
            }
            if (timeContainer2) {
                timeResizeObserver.observe(timeContainer2);
            }
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
                    } else if (container.id === 'phase-plot2-container' && plotDivSecondary) {
                        Plotly.Plots.resize(plotDivSecondary);
                    } else if (container.id === 'time-plot-container') {
                        Plotly.Plots.resize(timePlotDiv);
                    } else if (container.id === 'time-plot2-container' && timePlotDivSecondary) {
                        Plotly.Plots.resize(timePlotDivSecondary);
                    }
                }, 100);
            }
        });
    }

    // Helper functions
    function sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }


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
    
    function updateAxisRangeFromInputs(groupIndex, axisKey) {
        const range = phaseAxisRanges[groupIndex];
        const controls = phaseAxisControls[groupIndex];
        if (!range || !controls) {
            return;
        }

        const axisControls = controls[axisKey];
        const newMin = parseFloat(axisControls.minInput.value);
        const newMax = parseFloat(axisControls.maxInput.value);

        if (!Number.isFinite(newMin) || !Number.isFinite(newMax)) {
            return;
        }

        if (newMin < newMax) {
            range[axisKey].min = newMin;
            range[axisKey].max = newMax;
            axisControls.label.textContent = `[${newMin}, ${newMax}]`;

            if (!isSimulating) {
                updatePhasePlots();
            }
        } else {
            axisControls.minInput.value = range[axisKey].min;
            axisControls.maxInput.value = range[axisKey].max;
        }
    }

    function adjustAxisBound(groupIndex, axisKey, boundKey, delta) {
        const range = phaseAxisRanges[groupIndex];
        const controls = phaseAxisControls[groupIndex];
        if (!range || !controls) {
            return;
        }

        const axisControls = controls[axisKey];
        const minValue = parseFloat(axisControls.minInput.value);
        const maxValue = parseFloat(axisControls.maxInput.value);

        if (boundKey === 'min') {
            const candidate = +(minValue + delta).toFixed(3);
            if (candidate < maxValue) {
                axisControls.minInput.value = candidate;
                updateAxisRangeFromInputs(groupIndex, axisKey);
            }
        } else {
            const candidate = +(maxValue + delta).toFixed(3);
            if (candidate > minValue) {
                axisControls.maxInput.value = candidate;
                updateAxisRangeFromInputs(groupIndex, axisKey);
            }
        }
    }

    function setupAxisControlEvents() {
        phaseAxisControls.forEach((controls, index) => {
            if (!controls || !controls.x.minInput) {
                return;
            }

            const xStep = parseFloat(controls.x.minInput.step || '0.1');
            const yStep = parseFloat(controls.y.minInput.step || '0.1');

            controls.x.decreaseMin.addEventListener('click', () => adjustAxisBound(index, 'x', 'min', -xStep));
            controls.x.increaseMin.addEventListener('click', () => adjustAxisBound(index, 'x', 'min', xStep));
            controls.x.decreaseMax.addEventListener('click', () => adjustAxisBound(index, 'x', 'max', -xStep));
            controls.x.increaseMax.addEventListener('click', () => adjustAxisBound(index, 'x', 'max', xStep));

            controls.y.decreaseMin.addEventListener('click', () => adjustAxisBound(index, 'y', 'min', -yStep));
            controls.y.increaseMin.addEventListener('click', () => adjustAxisBound(index, 'y', 'min', yStep));
            controls.y.decreaseMax.addEventListener('click', () => adjustAxisBound(index, 'y', 'max', -yStep));
            controls.y.increaseMax.addEventListener('click', () => adjustAxisBound(index, 'y', 'max', yStep));

            controls.x.minInput.addEventListener('change', () => updateAxisRangeFromInputs(index, 'x'));
            controls.x.maxInput.addEventListener('change', () => updateAxisRangeFromInputs(index, 'x'));
            controls.y.minInput.addEventListener('change', () => updateAxisRangeFromInputs(index, 'y'));
            controls.y.maxInput.addEventListener('change', () => updateAxisRangeFromInputs(index, 'y'));
        });
    }

    setupAxisControlEvents();

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
        const groups = phaseGroups.length > 0 ? phaseGroups : (selectedModel.phase_groups || [{
            name: `${selectedModel.plot_axes[0]} vs ${selectedModel.plot_axes[1]}`,
            indices: selectedModel.plot_indices,
            axes: selectedModel.plot_axes
        }]);

        const filteredData = timeData.filter(point => point.t >= currentTime - timeWindow);
        const colorPalette = [
            ['#d1495b', '#0077b6'],
            ['#2a9d8f', '#f4a261']
        ];
        const plotTargets = [
            { div: timePlotDiv, container: timePlotContainer },
            { div: timePlotDivSecondary, container: timePlot2Container }
        ];

        groups.forEach((group, index) => {
            if (index >= plotTargets.length) {
                console.warn('More than two time-series groups are not supported yet.');
                return;
            }

            const target = plotTargets[index];
            if (!target.div || !target.container) {
                return;
            }

            const colors = colorPalette[index] || ['#d1495b', '#0077b6'];

            const traces = group.axes.slice(0, 2).map((axisLabel, axisIdx) => {
                const color = colors[axisIdx % colors.length];
                return {
                    x: filteredData.map(point => point.t),
                    y: filteredData.map(point => point.state ? point.state[group.indices[axisIdx]] : null),
                    mode: 'lines',
                    name: axisLabel,
                    line: { color, width: 2 },
                    yaxis: axisIdx === 1 ? 'y2' : 'y'
                };
            });

            const layout = {
                title: `Time Series (${group.name || `${group.axes[0]} vs ${group.axes[1]}`})`,
                xaxis: {
                    title: 'Time (s)',
                    range: [Math.max(0, currentTime - timeWindow), currentTime + 1]
                },
                yaxis: {
                    title: group.axes[0],
                    side: 'left',
                    color: traces[0]?.line?.color || '#d1495b'
                },
                yaxis2: {
                    title: group.axes[1],
                    side: 'right',
                    overlaying: 'y',
                    color: traces[1]?.line?.color || traces[0]?.line?.color || '#0077b6'
                },
                margin: { l: 50, r: 50, b: 50, t: 50 },
                showlegend: true
            };

            target.container.style.display = 'block';
            Plotly.react(target.div, traces, layout);
        });

        if (groups.length < 2 && timePlot2Container && timePlotDivSecondary) {
            timePlot2Container.style.display = 'none';
            Plotly.purge(timePlotDivSecondary);
        }
    }

    function simulationStep() {
        if (!isSimulating) return;
        
        const selectedModel = models[modelSelect.value];
        const ode = getOdeFunction(selectedModel, currentParams);
        const dt = 0.01;
        const speed = parseFloat(speedSlider.value);
        
        const derivatives = ode(currentTime, currentState);
        
        for (let i = 0; i < currentState.length; i++) {
            currentState[i] += derivatives[i] * dt * speed;
        }
        currentTime += dt * speed;
        
        timeData.push({
            t: currentTime,
            state: [...currentState]
        });
        
        if (timeData.length > 10000) {
            timeData = timeData.slice(-10000);
        }
        
        updateTimePlot();
        updatePhasePlots();
    }

    function updatePhasePlots() {
        const selectedModel = models[modelSelect.value];
        const groups = phaseGroups.length > 0 ? phaseGroups : (selectedModel.phase_groups || [{
            name: `${selectedModel.plot_axes[0]} vs ${selectedModel.plot_axes[1]}`,
            indices: selectedModel.plot_indices,
            axes: selectedModel.plot_axes,
            axis_ranges: selectedModel.axis_ranges
        }]);

        const plotTargets = [
            { div: plotDiv, container: phasePlotContainer },
            { div: plotDivSecondary, container: phasePlot2Container }
        ];

        groups.forEach((group, index) => {
            if (index >= plotTargets.length) {
                console.warn('More than two phase plots are not supported yet.');
                return;
            }

            const axisRange = phaseAxisRanges[index] || {
                x: { min: 0, max: 1 },
                y: { min: 0, max: 1 }
            };

            const target = plotTargets[index];
            if (!target.div || !target.container) {
                return;
            }

            target.container.style.display = 'block';
            renderPhasePlotForGroup(target.div, group, axisRange, index);
        });

        if (groups.length < 2 && plotDivSecondary && phasePlot2Container) {
            phasePlot2Container.style.display = 'none';
            plotDivSecondary.removeAllListeners?.('plotly_click');
            Plotly.purge(plotDivSecondary);
        }
    }

    function renderPhasePlotForGroup(plotElement, group, axisRange, groupIndex) {
        if (!plotElement) return;

        const selectedModel = models[modelSelect.value];
        const ode = getOdeFunction(selectedModel, currentParams);
        const xIdx = group.indices[0];
        const yIdx = group.indices[1];

        const xlim_min = axisRange.x.min;
        const xlim_max = axisRange.x.max;
        const ylim_min = axisRange.y.min;
        const ylim_max = axisRange.y.max;

        const gridSize = 20;
        const x_coords = [];
        const y_coords = [];
        const scale = Math.min(xlim_max - xlim_min, ylim_max - ylim_min) * 0.02;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = xlim_min + (i / (gridSize - 1)) * (xlim_max - xlim_min);
                const y = ylim_min + (j / (gridSize - 1)) * (ylim_max - ylim_min);
                
                const state = new Array(selectedModel.initial_conditions.length).fill(0);
                state[xIdx] = x;
                state[yIdx] = y;
                
                const derivatives = ode(0, state);
                const dx = derivatives[xIdx];
                const dy = derivatives[yIdx];
                const norm = Math.sqrt(dx * dx + dy * dy);
                
                if (norm > 0) {
                    const dx_norm = (dx / norm) * scale;
                    const dy_norm = (dy / norm) * scale;
                    
                    x_coords.push(x, x + dx_norm, null);
                    y_coords.push(y, y + dy_norm, null);
                }
            }
        }

        const plotData = [{
            x: x_coords,
            y: y_coords,
            mode: 'lines',
            type: 'scatter',
            name: 'Vector Field',
            line: { color: 'rgba(0,0,255,0.3)', width: 1 },
            hoverinfo: 'skip',
            hovertemplate: null
        }];

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
                mode: 'lines',
                type: 'scatter',
                name: `Trajectory ${index + 1}`,
                line: { width: 2, color: `hsl(${(index * 137.5) % 360}, 70%, 50%)` },
                hoverinfo: 'skip'
            });
            
            plotData.push({
                x: [traj.y0[xIdx]],
                y: [traj.y0[yIdx]],
                mode: 'markers',
                type: 'scatter',
                name: `IC ${index + 1}`,
                marker: { 
                    size: 8, 
                    color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                    symbol: 'circle',
                    line: { width: 2, color: 'white' }
                },
                hoverinfo: 'skip'
            });
        });

        if (isSimulating) {
            plotData.push({
                x: [currentState[xIdx]],
                y: [currentState[yIdx]],
                mode: 'markers',
                type: 'scatter',
                name: 'Current State',
                marker: { size: 10, color: 'red', symbol: 'circle' }
            });
        }

        const titleSuffix = group.name ? ` — ${group.name}` : '';
        const layout = {
            title: `${selectedModel.name} Phase Plane${titleSuffix}`,
            xaxis: { title: group.axes[0], range: [xlim_min, xlim_max], autorange: false },
            yaxis: { title: group.axes[1], range: [ylim_min, ylim_max], autorange: false },
            margin: { l: 50, r: 50, b: 50, t: 50 },
            showlegend: false
        };

        Plotly.react(plotElement, plotData, layout).then(() => {
            attachPhasePlotInteractions(plotElement, groupIndex, [xIdx, yIdx]);
        });
    }

    function attachPhasePlotInteractions(plotElement, groupIndex, indices) {
        if (!plotElement) {
            return;
        }

        const [xIdx, yIdx] = indices;

        plotElement.removeAllListeners?.('plotly_click');

        const existingHandler = plotElement._clickHandler;
        if (existingHandler) {
            plotElement.removeEventListener('click', existingHandler);
        }

        plotElement.on('plotly_click', function(data) {
            if (!data.points || data.points.length === 0) return;
            const point = data.points[0];
            if (point.curveNumber !== 0) return;

            const axisRange = phaseAxisRanges[groupIndex];
            const xlim_min = axisRange.x.min;
            const xlim_max = axisRange.x.max;
            const ylim_min = axisRange.y.min;
            const ylim_max = axisRange.y.max;
            const new_x = point.x;
            const new_y = point.y;

            if (new_x >= xlim_min && new_x <= xlim_max && new_y >= ylim_min && new_y <= ylim_max && !isSimulating) {
                const selectedModel = models[modelSelect.value];
                const initialCondition = [...selectedModel.initial_conditions];
                initialCondition[xIdx] = new_x;
                initialCondition[yIdx] = new_y;
                trajectories.push({ y0: initialCondition });
                setTimeout(() => updatePhasePlots(), 10);
            }
        });

        const clickHandler = function(event) {
            if (clickTimeout) {
                return;
            }
            
            clickTimeout = setTimeout(() => {
                clickTimeout = null;
            }, 300);
            
            const rect = plotElement.getBoundingClientRect();
            const x_pixel = event.clientX - rect.left;
            const y_pixel = event.clientY - rect.top;
            
            const layout = plotElement._fullLayout;
            if (layout && layout.xaxis && layout.yaxis) {
                const xaxis = layout.xaxis;
                const yaxis = layout.yaxis;
                
                const plotWidth = xaxis._length;
                const plotHeight = yaxis._length;
                const plotLeft = xaxis._offset;
                const plotBottom = yaxis._offset;
                
                const relativeX = (x_pixel - plotLeft) / plotWidth;
                const relativeY = (y_pixel - plotBottom) / plotHeight;
                
                const axisRange = phaseAxisRanges[groupIndex];
                const xlim_min = axisRange.x.min;
                const xlim_max = axisRange.x.max;
                const ylim_min = axisRange.y.min;
                const ylim_max = axisRange.y.max;
                
                const alt_x = xlim_min + relativeX * (xlim_max - xlim_min);
                const alt_y = ylim_min + (1 - relativeY) * (ylim_max - ylim_min);
                
                if (alt_x >= xlim_min && alt_x <= xlim_max && alt_y >= ylim_min && alt_y <= ylim_max && !isSimulating) {
                    const selectedModel = models[modelSelect.value];
                    const initialCondition = [...selectedModel.initial_conditions];
                    initialCondition[xIdx] = alt_x;
                    initialCondition[yIdx] = alt_y;
                    trajectories.push({ y0: initialCondition });
                    setTimeout(() => updatePhasePlots(), 10);
                }
            }
        };
        
        plotElement._clickHandler = clickHandler;
        plotElement.addEventListener('click', clickHandler);
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
        updatePhasePlots();
        if (!isSimulating) {
            updateTimePlot();
        }
    }

    // Start loading models when DOM is ready
    loadModels();
});
