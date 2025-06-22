import json
import csv
from typing import List, Dict, Any
from io import StringIO

class JSONToCSVConverter:
    @staticmethod
    def convert_to_csv(json_data: List[Dict[str, Any]], filename: str = None) -> str:
        """
        Convert JSON data to CSV format
        
        Args:
            json_data: List of dictionaries containing the data
            filename: Optional filename for saving CSV
        
        Returns:
            CSV string content
        """
        if not json_data:
            return ""
        
        # Get all unique keys from all dictionaries
        all_keys = set()
        for item in json_data:
            all_keys.update(item.keys())
        
        fieldnames = sorted(list(all_keys))
        
        # Create CSV content
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        
        writer.writeheader()
        for item in json_data:
            writer.writerow(item)
        
        csv_content = output.getvalue()
        output.close()
        
        # Save to file if filename provided
        if filename:
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                csvfile.write(csv_content)
        
        return csv_content
    
    @staticmethod
    def save_search_results(results: List[Dict[str, Any]], filename: str = "search_results.csv") -> str:
        """
        Save search results to CSV file
        
        Args:
            results: List of search result dictionaries
            filename: Output CSV filename
            
        Returns:
            Path to saved CSV file
        """
        return JSONToCSVConverter.convert_to_csv(results, filename)