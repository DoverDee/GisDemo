package gis.proxy;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class Proxy
 */
public class HttpProxy extends HttpServlet{
  private static final long serialVersionUID = 1L;

  /**
   * @see HttpServlet#HttpServlet()
   */
  public HttpProxy(){
    super();
    // TODO Auto-generated constructor stub
  }

  /**
   * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
    // TODO Auto-generated method stub
    processRequest(request, response);
  }

  /**
   * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
    // TODO Auto-generated method stub
    processRequest(request, response);
  }

  private void processRequest(HttpServletRequest request,
                              HttpServletResponse response) throws ServletException, IOException{

    String s = request.getQueryString().substring(10);

    //String urlString=request.getParameter("targetURL");

    URL url = new URL(s);
    URLConnection conn = url.openConnection();
    conn.setDoOutput(true);
    InputStreamReader reder = new InputStreamReader(conn.getInputStream(), "utf-8");
    BufferedReader breader = new BufferedReader(reder);

    String content = "";
    String result = "";
    while((content = breader.readLine()) != null){
      result += content;
    }
    System.out.println(result);
  }
}
