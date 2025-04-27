# analizzatore_dati/main.py

import argparse
from .data.importers import CSVImporter, JSONImporter, APIImporter
from .analysis.statistics import StatisticalAnalyzer
from .visualization.charts import BarChart, LineChart, ScatterPlot
from .config import load_config


def main():
    """Punto di ingresso principale dell'applicazione Analizzatore Dati."""

    parser = argparse.ArgumentParser(description='Analizzatore di Dati da riga di comando.')
    parser.add_argument('source_type', choices=['csv', 'json', 'api'], help='Tipo di sorgente dati (csv, json, api)')
    parser.add_argument('source_path', help='Percorso del file (per csv/json) o URL (per api)')
    parser.add_argument('--config', default='config.yaml', help='Percorso del file di configurazione')
    parser.add_argument('--chart_type', choices=['bar', 'line', 'scatter'], default='bar', help='Tipo di grafico da generare')
    parser.add_argument('--x_col', help='Colonna per l'asse X del grafico')
    parser.add_argument('--y_col', help='Colonna per l'asse Y del grafico')
    parser.add_argument('--title', default='Grafico Dati', help='Titolo del grafico')

    args = parser.parse_args()

    # Carica configurazione (opzionale, per API keys, ecc.)
    # config = load_config(args.config)

    # Importa i dati
    df = None
    try:
        if args.source_type == 'csv':
            importer = CSVImporter(args.source_path)
            df = importer.import_data()
        elif args.source_type == 'json':
            importer = JSONImporter(args.source_path)
            df = importer.import_data()
        elif args.source_type == 'api':
            # Potrebbe richiedere configurazione aggiuntiva (es. API key)
            importer = APIImporter(args.source_path)
            df = importer.import_data()
    except FileNotFoundError:
        print(f"Errore: File non trovato a '{args.source_path}'")
        return
    except Exception as e:
        print(f"Errore durante l'importazione dei dati: {e}")
        return

    if df is None or df.empty:
        print("Nessun dato importato o DataFrame vuoto.")
        return

    print("Dati importati con successo:")
    print(df.head())

    # Analizza i dati
    try:
        analyzer = StatisticalAnalyzer(df)
        summary = analyzer.get_summary_statistics()
        print("\nStatistiche descrittive:")
        print(summary)
    except Exception as e:
        print(f"Errore durante l'analisi dei dati: {e}")
        # Continua comunque per provare a visualizzare

    # Visualizza i dati (se specificate le colonne)
    if args.x_col and args.y_col:
        try:
            chart = None
            if args.chart_type == 'bar':
                chart = BarChart(df)
                chart.plot(args.x_col, args.y_col, title=args.title)
            elif args.chart_type == 'line':
                chart = LineChart(df)
                chart.plot(args.x_col, args.y_col, title=args.title)
            elif args.chart_type == 'scatter':
                chart = ScatterPlot(df)
                chart.plot(args.x_col, args.y_col, title=args.title)

            if chart:
                print(f"\nGenerazione grafico '{args.chart_type}'...")
                chart.show()
        except KeyError as e:
            print(f"Errore nella visualizzazione: Colonna '{e}' non trovata nel DataFrame.")
            print(f"Colonne disponibili: {list(df.columns)}")
        except Exception as e:
            print(f"Errore durante la visualizzazione dei dati: {e}")
    else:
        print("\nPer generare un grafico, specifica --x_col e --y_col.")

if __name__ == "__main__":
    main()