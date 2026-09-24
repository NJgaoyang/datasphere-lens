/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IChart } from 'app/types/Chart';
import { visualPluginToChart } from 'app/visualization/adapters/VisualPluginChartAdapter';
import createBuiltinLegacyCharts from 'app/visualization/plugins/legacy/createBuiltinLegacyCharts';
import { registerLegacyVisuals } from 'app/visualization/plugins/legacy/registerLegacyVisual';
import { registerExtendedVisualPlugins } from 'app/visualization/plugins/extended/registerExtendedVisualPlugins';
import { chartRegistry } from 'app/visualization/registry/ChartRegistry';
import { registerNativeVisualPlugins } from 'app/visualization/plugins/registerNativeVisualPlugins';
import { registerDefaultRenderers } from 'app/visualization/renderer/registerDefaultRenderers';
import { getChartPluginPaths } from 'app/utils/fetch';
import { Debugger } from 'utils/debugger';
import { CloneValueDeep } from 'utils/object';
import PluginChartLoader from './PluginChartLoader';

class ChartManager {
  private _loader = new PluginChartLoader();
  private _isLoaded = false;
  private _charts: IChart[] = [];
  private static _manager: ChartManager | null = null;

  private constructor() {
    registerDefaultRenderers();
    this._charts = createBuiltinLegacyCharts();
    registerLegacyVisuals(this._charts);
    registerNativeVisualPlugins();
    registerExtendedVisualPlugins();
  }

  public static instance() {
    if (!this._manager) {
      this._manager = new ChartManager();
    }
    return this._manager;
  }

  public async load() {
    if (this._isLoaded) {
      return;
    }
    const pluginsPaths = await getChartPluginPaths();
    return Debugger.instance.measure('Plugin Charts | ', async () => {
      await this._loadCustomizeCharts(pluginsPaths);
    });
  }

  public getAllCharts(): IChart[] {
    return chartRegistry.getAll().map(visualPluginToChart);
  }

  public getAllChartIcons() {
    return chartRegistry.getAll().reduce((acc, plugin) => {
      acc[plugin.type] = plugin.icon;
      return acc;
    }, {});
  }

  public getById(id?: string) {
    if (id === null || id === undefined) {
      return;
    }
    const plugin = chartRegistry.get(id);
    return plugin ? CloneValueDeep(visualPluginToChart(plugin)) : undefined;
  }

  public getDefaultChart(): IChart {
    const plugin = chartRegistry.getAll()[0];
    return plugin
      ? CloneValueDeep(visualPluginToChart(plugin))
      : CloneValueDeep(this._charts[0]);
  }

  private async _loadCustomizeCharts(paths: string[]) {
    if (this._isLoaded) {
      return this._charts;
    }

    const loadedPlugins = await this._loader.loadVisualPlugins(paths);
    const loadedCharts = loadedPlugins.map(plugin => plugin.chart) as IChart[];
    this._charts = this._charts.concat(loadedCharts);
    loadedPlugins.forEach(plugin =>
      chartRegistry.register(plugin.definition, { replace: true }),
    );
    this._isLoaded = true;
    return this._charts;
  }

}

export default ChartManager;
