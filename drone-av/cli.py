# cli/management.py
import click
import requests
from tabulate import tabulate

@click.group()
def cli():
    """Disaster Response Management CLI"""
    pass

@cli.command()
@click.option('--severity', type=int, help='Filter by severity level')
def list_emergencies(severity):
    """List active emergencies"""
    response = requests.get('http://localhost:3000/api/emergencies')
    data = response.json()
    
    if severity:
        data = [e for e in data if e['severity'] >= severity]
    
    print(tabulate(data, headers="keys"))

@cli.command()
@click.argument('coordinates', nargs=2, type=float)
def predict_risk(coordinates):
    """Predict disaster risk for coordinates"""
    from disaster_ml import DisasterPredictor
    predictor = DisasterPredictor()
    risk = predictor.predict_risk({'coordinates': coordinates})
    print(f"Risk score: {risk:.2%}")

if __name__ == '__main__':
    cli()
