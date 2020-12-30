using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class spawner : MonoBehaviour
{
    public GameObject platformPrefab;
    // Start is called before the first frame update
    void Start()
    {
        Vector3 SpawnerPosition = new Vector3();
        SpawnerPosition.y = -4.57f; 
        for (int i = 0; i < 20; i++)
        {
            SpawnerPosition.x = Random.Range(-1.9f, 1.9f);
            SpawnerPosition.y += Random.Range(2f, 3f);
            GameObject curPrefab = platformPrefab;
            curPrefab.gameObject.transform.localScale = new Vector3(Random.Range(0.3f, 1f), 1, 1);
            Instantiate(curPrefab, SpawnerPosition, Quaternion.identity);
        }
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
